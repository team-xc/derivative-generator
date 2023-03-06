import config from './config/index'
import { handelTemplate } from './core/index'
import { getDirList, getFileName, getFilePath } from './util/file'

const inquirer = require('inquirer')

const templateDirPath = getFilePath(config.templatePath)
const templateList = getDirList(templateDirPath, 'dir', false)

const start = () => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: '请选择模板',
      choices: [
        '刷新模板列表',
        ...templateList.map(item => getFileName(item)),
        '退出'
      ]
    }
  ]).then(({template}) => {
    switch (template) {
      case '刷新模板列表':
        start()
        break
      case '退出':
        break
      default:
        handelTemplate(template, start)
        break
    }
  })
}

start()