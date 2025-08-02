// 主题切换功能
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// 检查本地存储中的主题设置
const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
themeToggle.innerHTML = savedTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

themeToggle.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  themeToggle.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

// 输入方式切换
const inputBtns = document.querySelectorAll('.input-btn');
const inputContents = document.querySelectorAll('.input-content');

inputBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // 移除所有按钮的active状态
    inputBtns.forEach(b => b.classList.remove('active'));
    // 隐藏所有输入内容
    inputContents.forEach(content => content.classList.remove('active'));
    
    // 激活当前按钮
    btn.classList.add('active');
    
    // 显示对应的输入内容
    const targetId = btn.id.replace('Btn', 'Input');
    document.getElementById(targetId).classList.add('active');
  });
});

// 文件上传处理
const fileUpload = document.getElementById('fileUpload');
const fileName = document.getElementById('fileName');

fileUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    fileName.textContent = `已选择: ${file.name}`;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        document.getElementById('jsonInput').value = JSON.stringify(json, null, 2);
      } catch (error) {
        alert('文件不是有效的JSON格式');
      }
    };
    reader.readAsText(file);
  } else {
    fileName.textContent = '';
  }
});

// URL导入处理
const urlImport = document.getElementById('urlImport');
const fetchUrlBtn = document.getElementById('fetchUrlBtn');

fetchUrlBtn.addEventListener('click', async () => {
  const url = urlImport.value.trim();
  if (!url) {
    alert('请输入URL');
    return;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('网络响应失败');
    
    const data = await response.json();
    document.getElementById('jsonInput').value = JSON.stringify(data, null, 2);
  } catch (error) {
    alert(`获取URL内容失败: ${error.message}`);
  }
});

// 格式化JSON
const formatBtn = document.getElementById('formatBtn');
const jsonInput = document.getElementById('jsonInput');

formatBtn.addEventListener('click', () => {
  try {
    const json = JSON.parse(jsonInput.value);
    jsonInput.value = JSON.stringify(json, null, 2);
  } catch (error) {
    alert('JSON格式不正确');
  }
});

// JMESPath查询执行
const jmespathQuery = document.getElementById('jmespathQuery');
const executeQuery = document.getElementById('executeQuery');
const resultOutput = document.getElementById('resultOutput');

// 示例查询
const examples = [
  { query: 'items[*].name', description: '提取所有items的name字段' },
  { query: 'items[0]', description: '提取第一个item' },
  { query: 'items[?price > `100`]', description: '提取价格大于100的items' },
  { query: 'items[*].{name: name, price: price}', description: '提取name和price字段' }
];

const exampleList = document.getElementById('exampleList');
examples.forEach(example => {
  const li = document.createElement('li');
  li.innerHTML = `<strong>${example.query}</strong> - ${example.description}`;
  li.addEventListener('click', () => {
    jmespathQuery.value = example.query;
  });
  exampleList.appendChild(li);
});

// 保存的查询
let savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');

const savedQueryList = document.getElementById('savedQueryList');
const queryAlias = document.getElementById('queryAlias');
const saveQuery = document.getElementById('saveQuery');

function renderSavedQueries() {
  savedQueryList.innerHTML = '';
  savedQueries.forEach((query, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${query.alias}</strong>: ${query.query}`;
    li.addEventListener('click', () => {
      jmespathQuery.value = query.query;
    });
    
    // 添加删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.style.float = 'right';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = 'none';
    deleteBtn.style.color = 'inherit';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      savedQueries.splice(index, 1);
      localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
      renderSavedQueries();
    });
    
    li.appendChild(deleteBtn);
    savedQueryList.appendChild(li);
  });
}

renderSavedQueries();

saveQuery.addEventListener('click', () => {
  const query = jmespathQuery.value.trim();
  const alias = queryAlias.value.trim();
  
  if (!query) {
    alert('请输入查询表达式');
    return;
  }
  
  if (!alias) {
    alert('请输入别名');
    return;
  }
  
  // 检查是否已存在相同别名
  const existingIndex = savedQueries.findIndex(q => q.alias === alias);
  if (existingIndex >= 0) {
    savedQueries[existingIndex].query = query;
  } else {
    savedQueries.push({ alias, query });
  }
  
  localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
  queryAlias.value = '';
  renderSavedQueries();
});

executeQuery.addEventListener('click', () => {
  const jsonText = jsonInput.value.trim();
  const query = jmespathQuery.value.trim();
  
  if (!jsonText) {
    alert('请输入JSON数据');
    return;
  }
  
  if (!query) {
    alert('请输入查询表达式');
    return;
  }
  
  try {
    const jsonData = JSON.parse(jsonText);
    const result = jmespath.search(jsonData, query);
    resultOutput.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    resultOutput.textContent = `错误: ${error.message}`;
  }
});

// 复制结果
const copyResult = document.getElementById('copyResult');

copyResult.addEventListener('click', () => {
  const resultText = resultOutput.textContent;
  if (!resultText) {
    alert('没有结果可复制');
    return;
  }
  
  navigator.clipboard.writeText(resultText)
    .then(() => {
      const originalText = copyResult.innerHTML;
      copyResult.innerHTML = '<i class="fas fa-check"></i> 已复制';
      setTimeout(() => {
        copyResult.innerHTML = originalText;
      }, 2000);
    })
    .catch(err => {
      alert('复制失败: ' + err);
    });
});

// 导出Excel (简化为CSV格式下载)
const exportExcel = document.getElementById('exportExcel');

exportExcel.addEventListener('click', () => {
  const resultText = resultOutput.textContent;
  if (!resultText) {
    alert('没有结果可导出');
    return;
  }
  
  try {
    const result = JSON.parse(resultText);
    
    // 简单处理：如果结果是数组，则转换为CSV
    if (Array.isArray(result)) {
      // 获取所有字段名
      const headers = [...new Set(result.flatMap(Object.keys))];
      
      // 构建CSV内容
      let csvContent = headers.join(',') + '\n';
      result.forEach(item => {
        const row = headers.map(header => {
          const value = item[header];
          // 处理包含逗号或换行符的值
          if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',');
        csvContent += row + '\n';
      });
      
      // 创建下载链接
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'result.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // 如果不是数组，直接下载JSON
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'result.json');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    alert('导出失败: ' + error.message);
  }
});