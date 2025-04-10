document.addEventListener('DOMContentLoaded', function() {
    const mermaidCode = document.getElementById('mermaid-code');
    const previewDiv = document.getElementById('mermaid-preview');
const chartContainer = document.querySelector('.chart-container');
    const renderBtn = document.getElementById('render-btn');
    const exportSvgBtn = document.getElementById('export-svg');
    const exportPdfBtn = document.getElementById('export-pdf');
    const exportJpgBtn = document.getElementById('export-jpg');
    const jpgScale = document.getElementById('jpg-scale');
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomResetBtn = document.getElementById('zoom-reset');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    let scale = 1;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;

    // 缩放控制
    function updateTransform() {
        // 保持初始位置不变，仅应用缩放和拖拽变换
        chartContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    zoomInBtn.addEventListener('click', () => {
        scale = Math.min(scale * 1.2, 10);
        updateTransform();
    });

    zoomOutBtn.addEventListener('click', () => {
        scale = Math.max(scale / 1.2, 0.2);
        updateTransform();
    });

    zoomResetBtn.addEventListener('click', () => {
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
    });

    // 拖拽控制
    chartContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        chartContainer.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        chartContainer.style.cursor = 'move';
    });

    // 阻止缩放时的默认滚动行为
    chartContainer.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale = Math.max(0.2, Math.min(5, scale * delta));
            updateTransform();
        }
    }, { passive: false });

    // 选项卡切换
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // 更新选项卡状态
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 更新内容区域
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // 侧边栏切换
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        // 侧边栏状态变化时重新计算图表宽度
        const previewWidth = previewDiv.offsetWidth;
        const svg = previewDiv.querySelector('svg');
        if (svg) {
            svg.style.width = `${previewWidth}px`;
            updateTransform();
        }
    });

    // 初始化Mermaid
    mermaid.initialize({ startOnLoad: false });

    // 渲染图表
    renderBtn.addEventListener('click', function() {
        try {
            console.log('开始渲染图表，输入代码:', mermaidCode.value);
            chartContainer.innerHTML = '';
            const newPreview = document.createElement('div');
            const previewWidth = previewDiv.offsetWidth;
            newPreview.style.width = `${previewWidth}px`;
            newPreview.style.margin = '0';
            newPreview.innerHTML = mermaidCode.value;
            chartContainer.appendChild(newPreview);
            
            console.log('初始化Mermaid渲染');
            mermaid.init(undefined, newPreview);
            
            // 修复SVG的viewBox属性
            const svg = previewDiv.querySelector('svg');
            if (svg) {
                console.log('SVG元素已创建，尺寸:', svg.width.baseVal.value, 'x', svg.height.baseVal.value);
                const viewBox = svg.getAttribute('viewBox');
                if (viewBox && viewBox.includes('%')) {
                    const width = svg.getAttribute('width') || '100';
                    const height = svg.getAttribute('height') || '100';
                    svg.setAttribute('viewBox', `0 0 ${width.replace('%','')} ${height.replace('%','')}`);
                    console.log('修复viewBox属性:', svg.getAttribute('viewBox'));
                }
            } else {
                console.warn('未找到SVG元素，渲染可能失败');
            }
        } catch (e) {
            console.error('渲染错误:', e);
            previewDiv.innerHTML = `<div class="error">渲染错误: ${e.message}</div>`;
        }
    });

    // 导出SVG
    exportSvgBtn.addEventListener('click', function() {
        const svg = previewDiv.querySelector('svg');
        if (!svg) return;
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = 'mermaid-chart.svg';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });

    // 导出PDF
    exportPdfBtn.addEventListener('click', function() {
        const svg = previewDiv.querySelector('svg');
        if (!svg) return;
        
        const scale = parseInt(jpgScale.value);
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 获取SVG的原始尺寸
        const originalWidth = svg.width.baseVal.value;
        const originalHeight = svg.height.baseVal.value;
        
        // 计算基于1920px宽度的缩放比例
        const baseScale = 1920 / originalWidth;
        const finalScale = baseScale * scale;
        
        // 应用缩放后的尺寸
        const width = originalWidth * finalScale;
        const height = originalHeight * finalScale;
        
        // 设置canvas尺寸
        canvas.width = width;
        canvas.height = height;
        
        // 填充白色背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // 确保JPG导出也有白色背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // 创建Image对象
        const img = new Image();
        img.onload = function() {
            // 在canvas上绘制SVG
            ctx.drawImage(img, 0, 0, width, height);
            
            // 创建PDF文档
            const pdf = new window.jspdf.jsPDF({
                orientation: width > height ? 'landscape' : 'portrait',
                unit: 'pt',
                format: [width, height]
            });
            
            try {
                // 将canvas内容添加到PDF
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
                pdf.save('mermaid-chart.pdf');
            } catch (error) {
                console.error('PDF导出错误:', error);
                alert('PDF导出失败，请检查图表是否正确渲染');
            }
        };
        
        // 设置Image源
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });

    // 导出JPG
    exportJpgBtn.addEventListener('click', function() {
        const svg = previewDiv.querySelector('svg');
        if (!svg) return;
        
        const scale = parseInt(jpgScale.value);
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 计算基于1920px宽度的缩放比例
        const originalWidth = svg.width.baseVal.value;
        const baseScale = 1920 / originalWidth;
        const finalScale = baseScale * scale;
        
        const img = new Image();
        img.onload = function() {
            canvas.width = img.width * finalScale;
            canvas.height = img.height * finalScale;
            
            // 先填充白色背景
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const jpgUrl = canvas.toDataURL('image/jpeg');
            const downloadLink = document.createElement('a');
            downloadLink.href = jpgUrl;
            downloadLink.download = 'mermaid-chart.jpg';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });
    // Deepseek API配置
    const DEEPSEEK_API_KEY = '*********';
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
    const SYSTEM_PROMPT = "# 角色：Mermaid 代码生成器\n\n## 核心目标：\n你的主要功能是担任专业的 Mermaid 图表生成器。你将接收用户输入的自然语言文本。你的任务是分析这些文本，并生成最合适且 **语法绝对正确** 的 Mermaid 图表代码，以可视化方式呈现文本中描述的信息、关系、流程或结构。\n\n## 输入：\n- 用户提供的文本，描述一个场景、流程、层级结构、事件序列、数据结构、实体间关系、状态转换、项目时间线，或任何其他适合用 Mermaid 进行可视化的信息。\n\n## 输出要求（严格执行）：\n1.  **仅限 Mermaid 代码：** 你 **必须** 仅输出原始、有效的 Mermaid 图表代码主体。\n2.  **无包围符/代码块：** **绝对禁止** 在代码周围使用任何 markdown 代码围栏（如 ```mermaid ... ``` 或 ``` ... ```）。\n3.  **无解释说明：** **禁止** 包含任何介绍性短语（例如，“这是 Mermaid 代码：”、“根据您的输入：”、“我选择流程图是因为...”）、结束语、Mermaid 语法之外的标题（除非语法本身支持标题，如 `gantt` 图），或除 Mermaid 代码本身之外的任何其他文本。\n4.  **直接可渲染：** 输出必须语法正确，且能被任何标准的 Mermaid 处理器或渲染器直接使用/渲染。\n5.  **语法验证：** 在输出前，内部核验生成的代码是否严格遵守所选图表类型的官方 Mermaid 语法规则。将语法正确性置于最高优先级，避免常见的语法陷阱。\n\n## 处理步骤：\n1.  **分析输入：** 仔细阅读并理解用户文本。识别其中描述的关键实体、参与者、步骤、状态、关系、依赖、层级或时间顺序。\n2.  **选择最佳图表类型：** 基于分析，确定 **最适合** 的 Mermaid 图表类型以准确清晰地表示信息。考虑的选项包括：\n    *   `graph TD` / `graph LR` / `graph BT` / `graph RL` (流程图、思维导图、组织结构图)\n    *   `sequenceDiagram` (时序交互图)\n    *   `classDiagram` (类图)\n    *   `stateDiagram-v2` (状态机图)\n    *   `erDiagram` (实体关系图)\n    *   `gantt` (甘特图)\n    *   `pie` (饼图)\n    *   `journey` (用户旅程图)\n    *   其他适用的 Mermaid 类型。\n    选择能够有效传达核心信息的最简单的类型。\n3.  **生成 Mermaid 代码：** 使用选定的图表类型构建 Mermaid 代码。\n    *   使用直接源自用户输入文本的清晰简洁的名称命名节点、参与者、类、状态等。\n    *   准确表示所描述的连接、流程、序列、关系或状态。\n    *   **确保严格遵守所选图表类型的 Mermaid 语法。特别注意：**\n        *   **标识符（ID）与标签（Label）的区别：** 对于需要 ID 的元素（如类、节点），首先使用一个简单的、有效的标识符（通常是无空格的字母数字组合）。如果需要显示包含空格或特殊字符的描述性名称，请使用该图表类型对应的正确语法将其作为标签应用（例如，类图中的 `SimpleID[\"描述性标签\"]`，流程图中的 `id[\"标签\"]`）。**切勿将带引号或空格的字符串直接用作需要简单标识符的地方。**\n        *   **标签内的特殊字符转义：** **如果节点、边的标签文本（Label）本身包含需要特殊处理的字符，特别是双引号 (`\"`)，必须进行转义以避免语法冲突。推荐使用 HTML 实体编码进行转义，例如将 `\"` 替换为 `&quot;`。**\n        *   **元素定义顺序：** 确保所有元素（节点、类、参与者、状态等）在关系或链接中被引用 *之前* 已经被定义或声明。\n        *   **关键字和符号：** 正确使用箭头 (`-->`, `--`, `-.->`, `==>`, etc.)、连接符、括号、引号和特定图表类型的关键字。\n        *   **注释语法：** 如果需要注释（虽然最终输出不应包含解释性注释，但内部生成时可能用到），请使用 `%%`。\n4.  **确保一致性：** 生成的图表的结构和逻辑必须与用户输入文本的含义和细节紧密对应。\n5.  **格式化输出：** 严格遵守上述“输出要求”，**仅** 将生成的 **经过语法检查确认无误的** Mermaid 代码主体作为最终响应呈现。\n\n## 示例（内部思考过程 - 不输出此部分）：\n*   **用户输入：** “系统处理用户请求 '查询余额'。首先验证用户身份，如果成功，则查询数据库并返回 '余额信息'；如果失败，则返回 '认证失败' 消息。”\n*   **AI 分析：** 这描述了一个顺序流程，带有条件分支。序列图 (`sequenceDiagram`) 或流程图 (`graph TD`) 都可能适用。流程图更直观展示分支。关键步骤/节点：用户请求、验证身份、验证成功？、查询数据库、返回余额、返回失败消息。**注意：** 标签中包含引号，如 '查询余额'，需要转义。\n*   **AI 输出（实际 - 使用流程图）：**\n    ```mermaid\n    graph TD\n        A[\"用户请求 &quot;查询余额&quot;\"] --> B{验证用户身份};\n        B -- 成功 --> C[查询数据库];\n        C --> D[\"返回 &quot;余额信息&quot;\"];\n        B -- 失败 --> E[\"返回 &quot;认证失败&quot; 消息\"];\n    ```\n    *(注意：示例中的标签使用了 `&quot;` 来转义内部的引号)*\n\n## 最终指令：\n专注于仅生成 **语法完美** 且纯粹的 Mermaid 代码主体。做到精确、准确，并严格遵守输出格式和 **语法正确性（包括特殊字符处理）** 的限制。你的响应应直接以 Mermaid 代码的第一行开始（例如 `graph TD` 或 `sequenceDiagram`），并以代码的最后一行结束，前后不应包含任何其他内容。"

    // AI生成按钮点击事件
    const aiGenerateBtn = document.getElementById('ai-generate-btn');
    const aiInputText = document.getElementById('ai-input-text');
    const aiOutputText = document.getElementById('ai-output-text');

    // 调用Deepseek API的函数
    async function generateMermaidCode(userInput) {
        try {
            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: SYSTEM_PROMPT
                        },
                        {
                            role: 'user',
                            content: userInput
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API调用错误:', error);
            throw error;
        }
    }

    aiGenerateBtn.addEventListener('click', async function() {
        const userInput = aiInputText.value.trim();
        if (!userInput) {
            alert('请输入图表描述');
            return;
        }

        try {
            // 清空输出并禁用按钮
            aiOutputText.value = '';
            aiGenerateBtn.disabled = true;
            aiGenerateBtn.textContent = '生成中...';
            
            const mermaidCode = await generateMermaidCode(userInput);
            aiOutputText.value = mermaidCode;
            
            // 自动将生成的代码填充到编辑器并渲染
            document.getElementById('mermaid-code').value = aiOutputText.value;
            document.getElementById('render-btn').click();
        } catch (error) {
            alert(`生成失败: ${error.message}`);
        } finally {
            aiGenerateBtn.disabled = false;
            aiGenerateBtn.textContent = '生成图表';
        }
    });
});