document.addEventListener("DOMContentLoaded", () => {
    const exportBtn = document.getElementById("export-btn");
    const importBtn = document.getElementById("import-btn");
    const fileInput = document.getElementById("file-input");

    // レシピデータを取得する
    function getRecipeData() {
        const grid = [];
        for (let i = 0; i < 9; i++) {
            grid.push(document.getElementById(`slot-${i}`).value);
        }
        const result = document.getElementById("result").value;
        const count = document.getElementById("count").value;

        return {
            grid: grid,
            result: result,
            count: parseInt(count, 10) || 1
        };
    }

    // レシピデータをUIに反映する
    function setRecipeData(data) {
        if (data.grid && Array.isArray(data.grid)) {
            for (let i = 0; i < 9; i++) {
                if (data.grid[i] !== undefined) {
                    document.getElementById(`slot-${i}`).value = data.grid[i];
                }
            }
        }
        if (data.result !== undefined) {
            document.getElementById("result").value = data.result;
        }
        if (data.count !== undefined) {
            document.getElementById("count").value = data.count;
        }
    }

    // エクスポート処理
    exportBtn.addEventListener("click", () => {
        const recipeData = getRecipeData();
        const jsonStr = JSON.stringify(recipeData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `${recipeData.result || "recipe"}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // インポート処理
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
                setRecipeData(data);
            } catch (err) {
                alert("JSONファイルの読み込みに失敗しました。形式が正しいか確認してください。");
                console.error(err);
            }
        };
        reader.readAsText(file);
        
        // 同じファイルを選んでも発火するようにする
        fileInput.value = "";
    });
});
