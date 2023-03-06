import * as _path from 'path'
import * as _fs from 'fs'
import { checkFile, getBareTemplatePath, getFileName, readFile, renameFile, writeFile } from './file'
import config from '../config/index'
import { handleFile } from '../core/index'
import { toast } from './index'

const mime = require('mime-types')

const PizZip = require('pizzip')
const Docxtemplater = require('docxtemplater')

const replaceText = (text: string, options: ReplaceOptions): string => {
  const {environmentMap, replaceMap} = options
  let result = text
  replaceMap && replaceMap.forEach((value, key) => {
    result = result.replace(new RegExp(key, 'g'), value)
  })
  environmentMap.forEach((value, key) => {
    result = result.replace(new RegExp(config.placeholderPrefix + key + config.placeholderSuffix, 'g'), value)
  })
  return result
}

export const replaceFile = (file: string, option?: ReplaceOptions) => {
  checkFile(file, () => {
    const {environmentMap, replaceMap} = option || {}

    const allowReplaceFileTypes = config.allowReplaceFileTypes.map(item => mime.lookup(item))
    const fileMime = mime.lookup(file)

    if (getFileName(file) === config.templateConfigFileName) return

    if (_fs.lstatSync(file).isDirectory()) {
      const name = getFileName(file)
      const path = file.substring(0, file.lastIndexOf('/') + 1)
      const targetPath = _path.join(path, replaceText(name, {environmentMap, replaceMap}))

      renameFile(file, targetPath, () => {
        handleFile(targetPath, option)
      })

      return
    }

    if (fileMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      toast('info', '开始替换文件内容', getBareTemplatePath(file))
      replaceDocx(file, option)
      return
    }

    if (fileMime && allowReplaceFileTypes.includes(fileMime)) {
      readFile(file, content => {
        toast('info', '开始替换文件内容', getBareTemplatePath(file))
        writeFile(file, replaceText(content, {environmentMap, replaceMap}))
      })
    }
  })
}

export const replaceDocx = (source, options?: ReplaceOptions) => {
  const {environmentMap} = options || {}
  checkFile(source, () => {
    try {
      const content = _fs.readFileSync(source, 'binary')
      const zip = new PizZip(content)
      const doc = new Docxtemplater(zip, {
        delimiters: {start: config.placeholderPrefix, end: config.placeholderSuffix}
      })

      const data = {}
      environmentMap.forEach((value, key) => {
        data[key] = value
      })
      doc.setData(data)

      doc.render()

      const buf = doc.getZip().generate({type: 'nodebuffer'})
      _fs.writeFileSync(source, buf)

    } catch (_) {
      toast('error', '替换文件内容失败', getBareTemplatePath(source))
    }
  })
}