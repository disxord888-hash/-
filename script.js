document.addEventListener("DOMContentLoaded", () => {
    const MAX_RECIPES = 100;
    let currentIndex = 0;
    
    // 100個のレシピの配列を初期化
    let recipes = Array.from({ length: MAX_RECIPES }, () => ({
        grid: ["", "", "", "", "", "", "", "", ""],
        result: "",
        count: 1
    }));

    const exportBtn = document.getElementById("export-btn");
    const importBtn = document.getElementById("import-btn");
    const fileInput = document.getElementById("file-input");
    
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const clearBtn = document.getElementById("clear-btn");
    const indexDisplay = document.getElementById("recipe-index");

    // UIの要素
    const gridItems = Array.from({ length: 9 }, (_, i) => document.getElementById(`slot-${i}`));
    const resultItem = document.getElementById("result");
    const resultCount = document.getElementById("count");

    // 画面の入力を現在のレシピに保存する
    function saveCurrentRecipe() {
        const grid = gridItems.map(item => item.value);
        const result = resultItem.value;
        const count = parseInt(resultCount.value, 10) || 1;

        recipes[currentIndex] = { grid, result, count };
    }

    // 現在のレシピを画面に反映する
    function loadCurrentRecipe() {
        const currentRecipe = recipes[currentIndex];
        
        gridItems.forEach((item, i) => {
            item.value = currentRecipe.grid[i] || "";
        });
        resultItem.value = currentRecipe.result || "";
        resultCount.value = currentRecipe.count || 1;
        
        indexDisplay.textContent = currentIndex + 1;
    }

    // 入力イベントで自動保存
    [...gridItems, resultItem, resultCount].forEach(elem => {
        elem.addEventListener("input", saveCurrentRecipe);
    });

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
        // 空のレシピを除外するかそのまま保存するか。今回は全て保存する。
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
                    // 100個に満たない場合は初期値で埋める、100個を超える場合は切り捨てる
                    recipes = Array.from({ length: MAX_RECIPES }, (_, i) => {
                        if (data[i]) {
                            // データの整合性チェック
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
