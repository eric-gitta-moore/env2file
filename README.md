# env2file

> 本项目使用 Trae AI 工具编写，注意鉴别～

一个简单的工具，用于将环境变量内容写入文件。

A simple tool to write environment variables to files.

## 功能特点 | Features

- 支持将环境变量内容写入单个或多个文件
- 支持自动创建目标文件所需的目录结构
- 使用Base64编码确保特殊字符的正确传输
- 支持通过分号分隔多个写入指令

## 安装 | Installation

```bash
# 全局安装
npm install -g env2file

# 或者使用 npx
npx env2file

# 或者使用 pnpx
pnpx env2file
```

## 使用方法 | Usage

### 环境变量格式 | Environment Variable Format

使用`WRITE`环境变量来指定写入指令，格式如下：

```
WRITE="[文件路径](Base64编码的内容)"
```

多个写入指令可以用分号(;)分隔：

```
WRITE="[文件1](内容1的Base64);[文件2](内容2的Base64)"
```

### 示例 | Examples

1. 写入单个文件：

```bash
# 将"Hello World"写入test.txt

# 使用全局安装的命令
WRITE="[./test.txt](SGVsbG8gV29ybGQ=)" env2file

# 或者使用 npx
WRITE="[./test.txt](SGVsbG8gV29ybGQ=)" npx env2file

# 或者使用 pnpx
WRITE="[./test.txt](SGVsbG8gV29ybGQ=)" pnpx env2file
```

2. 写入多个文件：

```bash
# 同时写入两个配置文件
WRITE="[./config/db.json](eyJob3N0IjoibG9jYWxob3N0In0=);[./config/app.json](eyJwb3J0Ijo4MDgwfQ==)" env2file
```

3. 在CI/CD流程中使用：

```yaml
# GitHub Actions示例
steps:
  - name: Generate config files
    run: |
      WRITE="[./config.json]($(echo '{"key":"${{ secrets.API_KEY }}"}' | base64))" env2file
```

## 开发指南 | Development Guide

### 开发环境要求 | Requirements

- Node.js >= 14.0.0
- npm >= 6.0.0

### 本地开发 | Local Development

```bash
# 克隆项目
git clone https://github.com/yourusername/env2file.git

# 安装依赖
npm install

# 运行测试
npm test
```

### 测试 | Testing

项目使用 Jest 进行测试，测试文件位于 `__tests__` 目录下。

```bash
# 运行测试
npm test

# 监听模式运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

编写测试时，请确保：
- 测试文件命名为 `*.test.js`
- 覆盖主要功能和边界情况
- 提供清晰的测试描述

### 调试 | Debugging

1. 本地调试：
```bash
# 设置环境变量并运行
WRITE="[./test.txt](SGVsbG8=)" node --inspect-brk ./bin/env2file.js
```

2. 使用 VS Code 调试：
   - 在 `.vscode/launch.json` 中配置调试设置
   - 设置断点
   - 使用 VS Code 调试面板运行

## 注意事项 | Notes

### 文件路径处理 | File Path Handling
- 支持相对路径和绝对路径
- 如果目标文件所在目录不存在，会自动创建
- Windows 系统下请使用正斜杠(/)或双反斜杠(\\)作为路径分隔符

### 内容编码 | Content Encoding
- 内容必须是 Base64 编码的字符串
- 特殊字符（如换行符、引号等）需要先进行转义，再进行 Base64 编码
- 建议使用 `Buffer.from(content).toString('base64')` 进行编码

### 多文件处理 | Multiple Files
- 多个写入指令之间使用分号(;)分隔
- 分号在文件内容中需要进行转义处理
- 建议每个写入指令占用单独一行，提高可读性

### 安全性 | Security
- 避免将敏感信息直接写入代码中
- 在 CI/CD 环境中使用加密的环境变量
- 注意文件权限设置

## 贡献指南 | Contributing

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证 | License

MIT
