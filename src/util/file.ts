import * as _fs from 'fs'
import * as _path from 'path'
import { toast } from './index'
import config from '../config/index'

const _fsExtra = require('fs-extra')

export const checkFile = (path: string, success_callback: Function) => {
  try {
    _fs.accessSync(path, _fs.constants.F_OK | _fs.constants.R_OK | _fs.constants.W_OK)
    success_callback()
  } catch (err) {
    toast('warning', '无法访问文件', getBareTemplatePath(path))
  }
}

export const getBareTemplatePath = (path) => {
  return path.replace(getFilePath(config.outputPath) + '/', '')
}

export const getDirList = (path: string, type: 'dir' | 'file' | 'all', recursive: boolean = false): string[] => {
  if (!_fsExtra.existsSync(path)) {
    toast('warning', '文件夹不存在', getBareTemplatePath(path))
    return []
  }

  const dirList: string[] = []
  const dirInfo = _fs.readdirSync(path)

  dirInfo.forEach(item => {
    const location = _path.join(path, item)
    if (_fsExtra.existsSync(location)) {
      const info = _fs.statSync(location)
      if (info.isDirectory()) {
        if (type === 'dir' || type === 'all') {
          dirList.push(location)
        }
        if (recursive) {
          dirList.push(...getDirList(location, type, recursive))
        }
      }
      if (info.isFile()) {
        if (type === 'file' || type === 'all') {
          dirList.push(location)
        }
      }
    }
  })

  return dirList
}

export const readFile = (path: string, callback: (data: string) => void) => {
  checkFile(path, () => {
    try {
      callback(_fs.readFileSync(path).toString())
    } catch (_) {
      toast('error', '读取文件失败', getBareTemplatePath(path))
    }
  })
}

export const writeFile = (path: string, content: string) => {
  checkFile(path, () => {
    try {
      _fs.writeFileSync(path, content)
    } catch (_) {
      toast('error', '写入文件失败', getBareTemplatePath(path))
    }
  })
}

export const deleteFile = (path: string) => {
  checkFile(path, () => {
    try {
      _fs[_fs.statSync(path).isFile() ? 'unlink' : 'rmdir'](path, () => {})
    } catch (_) {
      toast('error', '删除文件失败', getBareTemplatePath(path))
    }
  })
}

export const renameFile = (path: string, newPath: string, callback?: () => void) => {
  checkFile(path, () => {
    try {
      _fs.renameSync(path, newPath)
      callback && callback()
    } catch (_) {
      toast('error', '重命名文件失败', getBareTemplatePath(path))
    }
  })
}

export const getFilePath = (path: string, create: boolean = true) => {
  _fsExtra.ensureDirSync(path)
  return _path.join(process.cwd(), path)
}

export const getFileName = (path: string): string => {
  return _path.basename(path)
}

export const cloneFile = (path: string, newPath: string, callback?: () => void) => {
  checkFile(path, () => {
    try {
      _fsExtra.copySync(path, newPath)
      callback && callback()
    } catch (_) {
      toast('error', '复制文件失败', getBareTemplatePath(path))
    }
  })
}