# dsh-appearance

DeepSeek Harness 的外观自定义插件 —— 换颜色、字体、壁纸、圆角、透明度、动画，全部在设置里点几下就好。

![screenshot](docs/screenshot.png)

> 截图待补：安装后打开「设置 → 外观」，截图放到 `docs/screenshot.png`。

## 功能

| 分组 | 可调项 |
|---|---|
| **颜色** | 主色、背景色、文字色、边框色、悬停背景 |
| **字体** | 字体族（font-family）、字号、字重 |
| **壁纸** | 图片 URL / 本地选图、纯色、渐变 CSS |
| **形状** | 圆角、阴影强度 |
| **效果** | 透明度、动画速度 |

所有设置实时生效，保存在浏览器本地（`localStorage`），刷新不丢。

## 安装

### 方式一：从插件市场

DSH → 设置 → 插件 → 插件市场 → 搜索 `appearance` → 安装。

### 方式二：从 GitHub 直接装

DSH → 设置 → 插件 → 从 URL 安装，填入：

```
https://github.com/<你的用户名>/dsh-appearance
```

### 方式三：本地开发

```bash
# 把本仓库复制到 DSH profile 的 vendor 目录
cp -r dsh-appearance ~/.dsh/profiles/desktop/vendor/
```

然后在 profile 的 `package.json` 里加：

```json
{
  "dependencies": {
    "dsh-appearance": "file:./vendor/dsh-appearance"
  }
}
```

再 `pnpm install`。

## 使用

安装后打开：**设置 → 外观**

- 改颜色：点色块选色
- 换壁纸：填图片 URL，或点「选择图片」
- 改字体：填字体族（如 `"Microsoft YaHei", sans-serif`）
- 想恢复默认：插件面板里有「重置」

## 兼容性

- 需要 DSH Web GUI（`dsh web`）
- 依赖 `@deepseek-ai/dsh-client-runtime`、`dsh-client-ui-settings`、`dsh-client-ui-settings-plugins`
- 纯客户端插件（`client.js` 自注册），无主机侧逻辑

## 结构

```
dsh-appearance/
├─ package.json        # 插件元数据 + dsh.bundle/client 配置
├─ index.js            # host 侧（空实现，仅导出 name）
├─ client.js           # 客户端 UI（18KB，自注册到 __ModuleLoader__）
└─ cordis.patch.yml    # bundle 补丁（insert 插件）
```

## License

MIT
