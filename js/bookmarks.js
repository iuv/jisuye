// 处理收藏夹数据
function saveBookmark(html) {
    // 隐藏导入页面
    $('#inBookmarks').hide();
    let bms = parseBookmarks(html);
    bookmarkExe("收藏", bms);
    editData(false);
}
// 递归遍历收藏
function bookmarkExe(tit, bms) {
    if (bms.length > 0) {
        let tmp = { "group": tit, "list": [] };
        for (let i = 0; i < bms.length; i++) {
            let bm = bms[i];
            if (bm.url) {
                tmp.list.push({ "n": subStr(bm.name, 10), "l": bm.url, "c": "", "k": "" });
            } else {
                bookmarkExe(tit + "-" + bm.name, bm.children);
            }
        }
        json.links.push(tmp)
    }
}

// 获取上传文件的 DOM 元素
const fileInput = document.getElementById('fileId');

// 监听上传文件的 change 事件
fileInput.addEventListener('change', (event) => {
  // 获取上传的文件对象
  const file = event.target.files[0];

  // 创建 FileReader 对象
  const reader = new FileReader();

  // 定义回调函数，当文件读取完成后执行
  reader.onload = () => {
    // 打印文件内容
    saveBookmark(reader.result);
  };

  // 调用 FileReader 的 readAsText 方法，开始读取文件内容
  reader.readAsText(file);
});

function parseBookmarks(bookmarksHTML) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(bookmarksHTML, "text/html");
    const rootList = doc.getElementsByTagName('dl')[0];
    const bookmarks = [];
    parseList(rootList, bookmarks);
    return bookmarks;
}

function parseList(list, result) {
    let node = list.firstChild;
    while (node) {
        if (node.nodeName === 'DT') {
            if (node.children[0].nodeName === 'A') {
                // URL
                result.push({
                    name: node.children[0].textContent,
                    url: node.children[0].href
                });
            } else {
                // Folder
                const folder = {
                    name: node.children[0].textContent,
                    children: []
                };
                result.push(folder);
                parseList(node.children[1], folder.children);
            }
        }
        node = node.nextSibling;
    }
}
// 截取标题长度
function subStr(str, len) {
    let reg = /[^\x00-\xff]/g; // 匹配中文字符的正则表达式
    if (str.replace(reg, 'mm').length <= len) {
        return str; // 如果给定字符串小于指定长度，则返回原字符串
    }
    let sliceLen = Math.floor(len / 2); // 初始截取长度为指定长度除以2
    for (let i = sliceLen; i < str.length; i++) {
        let temp = str.slice(0, i).replace(reg, 'mm');
        if (temp.length >= len) { // 如果已经满足指定长度则直接返回
            return str.slice(0, temp.replace(/mm/g, 'm').length);
        }
    }
    return str+".."; // 否则返回原字符串
}