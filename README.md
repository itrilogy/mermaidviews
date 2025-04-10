# Mermaid课题研究图表生成器

## 项目描述
这是一个基于Mermaid.js的图表编辑器，支持通过手动输入Mermaid语法或AI自动生成图表代码，并提供多种导出格式。

## 功能特点
- 手动输入Mermaid语法代码并实时预览
- AI自动生成Mermaid图表代码
- 支持SVG、PDF、JPG等多种导出格式
- 图表缩放和拖拽功能
- 响应式设计，适配不同屏幕尺寸

## 使用方法
1. 克隆或下载本项目
2. 在浏览器中打开index.html文件
3. 配置Deepseek API密钥(见下方说明)
4. 在编辑器选项卡中输入Mermaid语法代码，或使用AI生成选项卡自动生成
5. 点击"渲染图表"按钮预览效果
6. 使用导出按钮保存图表

## API密钥配置
1. 访问[Deepseek官网](https://www.deepseek.com)获取API密钥
2. 在app.js文件中找到`DEEPSEEK_API_KEY`变量
3. 将您的API密钥赋值给该变量

⚠️ 安全提示: 请妥善保管您的API密钥，不要将其提交到版本控制系统或公开分享。

## 依赖
- Mermaid.js
- jspdf

## 作者
Kwangwah Hung