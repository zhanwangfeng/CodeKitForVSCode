# Development Workflow

## 一、开发阶段

1. 切到 main 并拉取最新：`git checkout main && git pull`
2. 创建开发分支：`git checkout -b dev{ver}`（ver 由开发者人为指定）
3. 编写设计文档：`docs/design.{ver}.md`
4. 修改代码
5. 等待开发者测试通过
6. 根据当前分支的所有提交记录，更新所有 md 文档中关于该版本的变更说明（`CHANGELOG.md` 及涉及的功能文档）

## 二、合并阶段

7. 推送开发分支：`git push origin dev{ver}`
8. 在 GitHub 创建 Pull Request 并合并到 main（网页操作或通过 API）
9. 切回 main 并拉取合并结果：`git checkout main && git pull`
10. 打标签并推送：`git tag v{ver} && git push origin v{ver}`

## 三、发布阶段

11. 打包 vsix 文件：`npm run package`（产物输出到 `release/code-kit-for-vscode-{ver}.vsix`，需 Node 20+）
12. 创建 GitHub Release 并上传 vsix 附件：
    - release notes 取自 `CHANGELOG.md` 中该版本的变更说明
    - 通过 GitHub API 创建 Release（关联 tag `v{ver}`）并上传 `release/*.vsix` 作为附件
    - 鉴权 token 可从 git 缓存读取：`echo "protocol=https\nhost=github.com\n" | git credential fill`
