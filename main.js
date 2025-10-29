eruda.init();

function convertAndDownload() {
    const markdownText = document.getElementById('markdownInput').value;
    if (!markdownText.trim()) return alert("请输入 Markdown 内容！");

    // 询问用户要保存的文件名（无需扩展名）
    let filename = prompt('请输入要保存的文件名（无需扩展名）：', 'document');
    // 取消或空字符串时中止
    if (filename === null) return; // 用户取消
    filename = String(filename).trim();
    if (!filename) {
        alert('文件名不能为空。');
        return;
    }
    // 基本文件名清理：替换掉非法文件名字符
    filename = filename.replace(/[\\/:*?"<>|]+/g, '_');

    const htmlContent = marked.parse(markdownText);
    const content = `\n        <!DOCTYPE html>\n        <html>\n        <head><meta charset=\"UTF-8\"></head>\n        <body>${htmlContent}</body></html>`;
    const blob = new Blob([content], { type: "application/msword;charset=utf-8" });
    // 自动为用户加上 .doc 扩展名
    saveAs(blob, filename + '.doc');
}

function showMindMap() {
    const markdownText = document.getElementById('markdownInput').value;
    if (!markdownText.trim()) return alert("请输入 Markdown 内容！");

    const modal = document.getElementById('mindmapModal');
    const pre = document.getElementById('modalMarkmapPre');
    // 使用 textContent 避开 HTML 注入，并先隐藏预渲染的原始 Markdown，防止闪烁
    pre.classList.add('loading');
    pre.setAttribute('aria-busy', 'true');
    pre.textContent = markdownText;

    // 显示模态框并阻止背景滚动（模态内的 pre 仍保持隐藏，直到渲染完成）
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';

    // 使用 MutationObserver 来检测 markmap 渲染出的 svg 或其他节点，渲染完成时显示内容
    try {
        const observer = new MutationObserver((mutations, obs) => {
            if (pre.querySelector('svg') || pre.querySelector('canvas') || pre.querySelector('svg')) {
                pre.classList.remove('loading');
                pre.setAttribute('aria-busy', 'false');
                obs.disconnect();
                try { delete pre._mmObserver; } catch (e) {}
            }
        });
        // 把 observer 引用保存到元素上，便于关闭时清理
        pre._mmObserver = observer;
        observer.observe(pre, { childList: true, subtree: true });

        // 稍作延迟以确保 markmap-autoloader 已解析并能找到新的 .markmap 元素
        setTimeout(() => {
            try {
                markmap.autoLoader.renderAll();
            } catch (e) {
                console.error('渲染思维导图失败：', e);
            }
        }, 80);

        // 兜底：2s 后如果还没渲染完成，则显示内容以避免永久隐藏（可调整或移除）
        setTimeout(() => {
            if (pre.classList.contains('loading')) {
                pre.classList.remove('loading');
                pre.setAttribute('aria-busy', 'false');
                if (pre._mmObserver) try { pre._mmObserver.disconnect(); delete pre._mmObserver; } catch (e) {}
            }
        }, 2000);
    } catch (e) {
        console.error('设置 MutationObserver 失败：', e);
        // 回退到直接渲染
        try {
            markmap.autoLoader.renderAll();
        } catch (err) {
            console.error('渲染思维导图失败：', err);
            // 显示内容，避免一直隐藏
            pre.classList.remove('loading');
            pre.setAttribute('aria-busy', 'false');
        }
    }
}

function closeMindMapModal() {
    const modal = document.getElementById('mindmapModal');
    const pre = document.getElementById('modalMarkmapPre');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    // 恢复页面滚动
    document.documentElement.style.overflow = '';
    // 断开可能存在的 observer，避免内存泄漏或残留回调
    if (pre && pre._mmObserver) {
        try { pre._mmObserver.disconnect(); } catch (e) {}
        try { delete pre._mmObserver; } catch (e) {}
    }
    // 同时移除 loading 状态并清空内容
    if (pre) {
        pre.classList.remove('loading');
        pre.setAttribute('aria-busy', 'false');
        pre.textContent = '';
    }
}

// 绑定模态相关事件（关闭按钮、点击背景、ESC 键）
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('mindmapModal');
    const closeBtn = document.getElementById('mindmapClose');

    if (!modal) return;

    // 关闭按钮
    if (closeBtn) closeBtn.addEventListener('click', closeMindMapModal);

    // 点击背景关闭
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeMindMapModal();
    });

    // ESC 关闭
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.key === 'Esc') {
            if (modal.classList.contains('open')) closeMindMapModal();
        }
    });
});
