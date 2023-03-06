import * as _path from 'path'
import { cloneFile, deleteFile, getDirList, getFileName, getFilePath, readFile, renameFile } from '../util/file'
import { replaceFile } from '../util/replace'
import config from '../config/index'
import { toast } from '../util/index'

const inquirer = require('inquirer')

const templateDirPath = getFilePath(config.templatePath)
const outputDirPath = getFilePath(config.outputPath)

export const handelTemplate = (template: string, callback: () => void) => {
  const sourceTemplatePath = _path.join(templateDirPath, template)
  const targetTemplatePath = _path.join(outputDirPath, `.$${template}_${new Date().getTime()}`)

  cloneFile(sourceTemplatePath, targetTemplatePath, () => {
    const templateConfigFile = _path.join(targetTemplatePath, config.templateConfigFileName)

    readFile(templateConfigFile, async data => {
      const templateConfig = JSON.parse(data) as TemplateConfig
      const {input = [], replace = []} = templateConfig || {}

      const {fileName} = await inquirer.prompt([
        {
          type: 'input',
          name: 'fileName',
          message: '请输入目标文件名',
          default: getFileName(targetTemplatePath)
        }
      ])

      const targetPath = _path.join(outputDirPath, fileName)

      const environmentMap = new Map<string, string>()
      const replaceMap = new Map<string, string>()

      const questions = input.map(item => {
        return {
          type: 'input',
          name: item.key,
          message: `请输入${item.key}`,
          default: item.default
        }
      })
      const values = await inquirer.prompt(questions)

      Object.keys(values).forEach(key => environmentMap.set(key, values[key]))
      replace.forEach(item => {
        const {source, target} = item
        if (target.startsWith('${') && target.endsWith('}')) {
          const key = target.substring(2, target.length - 1)
          replaceMap.set(source, environmentMap.get(key))
        } else {
          replaceMap.set(source, target)
        }
      })

      toast()
      toast('success', '准备就绪，已加载', environmentMap.size + replaceMap.size, '个变量')

      handleFile(targetTemplatePath, {environmentMap, replaceMap})
      renameFile(targetTemplatePath, targetPath, () => {
        deleteFile(_path.join(targetPath, config.templateConfigFileName))
        toast()
        toast('success', '模板生成成功')
        toast('success', '生成路径', targetPath)
        toast('success', '生成文件名', getFileName(targetPath))
        toast()
        callback && callback()
      })
    })
  })
}

export const handleFile = (path: string, options: ReplaceOptions) => {
  const files = getDirList(path, 'all', true)
  files.forEach(file => replaceFile(file, options))
}