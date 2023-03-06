# 衍生品生成器

## 介绍
这是一个用于生成衍生品的工具，它可以根据模板母版生成衍生品。

`template` 目录下的文件是模板母版，`output` 目录下的文件是生成的衍生品。

## 使用方法
在模版母版根目录下配置 `generator.config.json` 文件，配置文件格式如下：

```json
{
  "input": [
    {
      "key": "name",
      "default": "默认名称"
    }
  ],
  "replace": [
    {
      "source": "ABC",
      "target": "123"
    },
    {
      "source": "app_name",
      "target": "${name}"
    }
  ]
}
```

`input` 字段是用户输入的配置，`replace` 字段是替换模板中的内容。

### 字段
- `${name}`：从用户输入的配置中获取

### 占位符
`{{_xxx_}}`

### 支持替换
- 文件/文件夹名称，如：`abc-{{_name_}}.txt`，替换后为 `abc-默认名称.txt`
- 文件内容，如：`123 {{_name_}} 456`，替换后为 `123 默认名称 456`
- 全局替换，如：`123 ABC 456`，替换后为 `123 123 456`
- `.docx` 文件，和文件内容替换一样，但不支持全局替换

### 支持文件类型

自行修改 `config/index.ts` 中的 `allowReplaceFileTypes` 字段