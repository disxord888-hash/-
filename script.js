document.addEventListener("DOMContentLoaded", () => {
    const MAX_RECIPES = 100;
    let currentIndex = 0;
    
    // 100個のレシピの配列を初期化
    let recipes = Array.from({ length: MAX_RECIPES }, () => ({
        grid: ["", "", "", "", "", "", "", "", ""],
        result: "",
        count: 1
    }));

    // マイクラの装飾カラーコード
    const mcColors = {
        '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
        '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
        '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
        'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF'
    };

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#39;');
    }

    // § から始まるカラーコードをHTMLのspanにパース
    function parseMCText(text) {
        if (!text) return "";
        let html = "";
        const lines = text.split('\n');
        let currentColor = '#FFFFFF';

        for (let i = 0; i < lines.length; i++) {
            let parts = lines[i].split('§');
            if (parts.length > 0) {
                html += `<span style="color: ${currentColor}">${escapeHtml(parts[0])}</span>`;
            }
            for (let j = 1; j < parts.length; j++) {
                let part = parts[j];
                if (part.length > 0) {
                    let code = part.charAt(0).toLowerCase();
                    let content = part.substring(1);
                    if (mcColors[code]) {
                        currentColor = mcColors[code];
                    }
                    html += `<span style="color: ${currentColor}">${escapeHtml(content)}</span>`;
                } else {
                    // §§のような場合のエラーハンドリング
                    html += `§`;
                }
            }
            if (i < lines.length - 1) {
                html += `<br>`;
            }
        }
        return html;
    }

    const exportBtn = document.getElementById("export-btn");
    const importBtn = document.getElementById("import-btn");
    const fileInput = document.getElementById("file-input");
    
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const clearBtn = document.getElementById("clear-btn");
    const indexDisplay = document.getElementById("recipe-index");

    // UIの要素
    const gridInputs = Array.from({ length: 9 }, (_, i) => document.getElementById(`slot-${i}`));
    const gridPreviews = Array.from({ length: 9 }, (_, i) => document.getElementById(`preview-slot-${i}`));
    const resultInput = document.getElementById("result");
    const resultPreview = document.getElementById("preview-result");
    const resultCount = document.getElementById("count");

    // 画面の入力を現在のレシピに保存する
    function saveCurrentRecipe() {
        const grid = gridInputs.map(item => item.value);
        const result = resultInput.value;
        const count = parseInt(resultCount.value, 10) || 1;

        recipes[currentIndex] = { grid, result, count };
    }

    // 現在のレシピを画面に反映する
    function loadCurrentRecipe() {
        const currentRecipe = recipes[currentIndex];
        
        gridInputs.forEach((input, i) => {
            const val = currentRecipe.grid[i] || "";
            input.value = val;
            gridPreviews[i].innerHTML = parseMCText(val);
        });
        
        const resVal = currentRecipe.result || "";
        resultInput.value = resVal;
        resultPreview.innerHTML = parseMCText(resVal);

        resultCount.value = currentRecipe.count || 1;
        indexDisplay.textContent = currentIndex + 1;
    }

    // 入力とプレビュー領域の切り替えを設定
    function setupEditToggle(preview, input) {
        // プレビューをクリックかフォーカスで非表示にし、inputを表示
        const showInput = () => {
            preview.style.display = 'none';
            input.style.display = 'block';
            input.focus();
        };

        preview.addEventListener('click', showInput);
        preview.addEventListener('focus', showInput);

        // inputからフォーカスが外れたら保存してプレビューへ
        input.addEventListener('blur', () => {
            preview.innerHTML = parseMCText(input.value);
            input.style.display = 'none';
            preview.style.display = 'block';
            saveCurrentRecipe();
        });

        input.addEventListener('input', () => {
            saveCurrentRecipe();
        });
    }

    for (let i = 0; i < 9; i++) {
        setupEditToggle(gridPreviews[i], gridInputs[i]);
    }
    setupEditToggle(resultPreview, resultInput);
    
    // countの変更でも保存
    resultCount.addEventListener('input', saveCurrentRecipe);

    // ナビゲーション
    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            loadCurrentRecipe();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentIndex < MAX_RECIPES - 1) {
            currentIndex++;
            loadCurrentRecipe();
        }
    });

    // クリア
    clearBtn.addEventListener("click", () => {
        recipes[currentIndex] = {
            grid: ["", "", "", "", "", "", "", "", ""],
            result: "",
            count: 1
        };
        loadCurrentRecipe();
    });

    // 一括エクスポート処理 (100個すべて)
    exportBtn.addEventListener("click", () => {
        const jsonStr = JSON.stringify(recipes, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `recipes_100.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // 一括インポート処理
    importBtn.addEventListener("click", () => {
        fileInput.click();
    });

    // ファイルが選択されたら読み込む
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (Array.isArray(data)) {
                    recipes = Array.from({ length: MAX_RECIPES }, (_, i) => {
                        if (data[i]) {
                            return {
                                grid: Array.isArray(data[i].grid) ? data[i].grid : ["", "", "", "", "", "", "", "", ""],
                                result: data[i].result || "",
                                count: parseInt(data[i].count, 10) || 1
                            };
                        } else {
                            return {
                                grid: ["", "", "", "", "", "", "", "", ""],
                                result: "",
                                count: 1
                            };
                        }
                    });
                    currentIndex = 0;
                    loadCurrentRecipe();
                    alert("読み込みが完了しました。");
                } else {
                    alert("対応していないファイル形式です。(配列ではありません)");
                }
            } catch (err) {
                alert("JSONファイルの読み込みに失敗しました。形式が正しいか確認してください。");
                console.error(err);
            }
        };
        reader.readAsText(file);
        
        fileInput.value = "";
    });

    // 初期化
    loadCurrentRecipe();
});
