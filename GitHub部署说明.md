# GitHub Pages 部署说明

本文件夹是完整、独立的网站仓库。将本文件夹内的全部内容上传到新的 GitHub 仓库根目录即可，不需要上传外层的原始项目目录。

## 首次部署

1. 在 GitHub 新建一个空仓库，仓库名可以任意。
2. 上传本文件夹内的全部文件和隐藏文件，特别保留 `.github` 与 `.gitignore`。
3. 打开仓库“设置”→“页面”，将来源选择为“GitHub Actions”。
4. 在“操作”页面等待“部署个人网站”完成，页面将显示访问地址。

后续只要推送到 `main` 分支，网站会自动重新构建和发布。

## 本地预览

```bash
npm install
npm run dev
```

生产构建检查：

```bash
npm run build
npm run preview
```

## 重要文件

- `src/App.jsx`：页面文字、项目内容和页面结构。
- `src/styles.css`：样式与响应式布局。
- `public/assets/`：图片、视频与简历 PDF。
- `.github/workflows/deploy.yml`：自动部署脚本，请保留。
- `vite.config.js`：确保 GitHub 项目页能正确加载图片、视频和 PDF。
