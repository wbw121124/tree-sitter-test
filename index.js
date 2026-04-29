import { Parser, Language } from 'web-tree-sitter';
import { readFileSync, writeFile } from 'fs';
import { performance } from 'perf_hooks';

// 记录时间
const startTime = performance.now();

async function initParser() {
	await Parser.init();
	return new Parser();
}
const parser = await initParser();
const Lang = await Language.load('./tree-sitter-javascript.wasm');
parser.setLanguage(Lang);
// 获取本代码的源代码
const sourceCode = readFileSync('./index.js', 'utf-8');
/*
// 解析一个简单的字符串
const testCode = `const x = "hello";`;
const testTree = parser.parse(testCode);

function dumpTree(node, indent = 0) {
	console.log(' '.repeat(indent) + node.type, JSON.stringify(node.text));
	for (const child of node.namedChildren) {
		dumpTree(child, indent + 2);
	}
}
dumpTree(testTree.rootNode);
/*/
const tree = parser.parse(sourceCode);
function cstToHast(node, sourceCode) {
	const children = [];

	// 遍历所有子节点（包括匿名的）
	let lastEnd = node.startIndex;

	for (const child of node.children) {
		// 1. 补上前面可能漏掉的文本（空白、标点等）
		if (child.startIndex > lastEnd) {
			const gap = sourceCode.slice(lastEnd, child.startIndex);
			if (gap) children.push({ type: 'text', value: gap });
		}

		// 2. 处理这个子节点
		if (child.isNamed && child.namedChildren.length > 0) {
			// 有子节点的，递归
			children.push(...cstToHast(child, sourceCode));
		} else {
			// 叶子节点（命名或匿名）
			const text = sourceCode.slice(child.startIndex, child.endIndex);
			const scope = child.type;

			if (scope) {
				children.push({
					type: 'element',
					tagName: 'span',
					properties: { className: [scope] },
					children: [{ type: 'text', value: text }],
				});
			} else {
				children.push({ type: 'text', value: text });
			}
		}

		lastEnd = child.endIndex;
	}

	// 3. 补上节点末尾可能漏掉的文本
	if (node.endIndex > lastEnd) {
		const tail = sourceCode.slice(lastEnd, node.endIndex);
		if (tail) children.push({ type: 'text', value: tail });
	}

	return children;
}

function rootToHast(tree, sourceCode) {
	return {
		type: 'root',
		children: cstToHast(tree.rootNode, sourceCode),
	};
}

function hastToHtml(node) {
	if (node.type === 'text') return escapeHtml(node.value);
	if (node.type === 'element') {
		const classStr = (node.properties.className || [])
			.filter(Boolean)
			.join(' ');
		const children = (node.children || []).map(hastToHtml).join('');
		return `<span class="${classStr}">${children}</span>`;
	}
	if (node.type === 'root') {
		return (node.children || []).map(hastToHtml).join('');
	}
	return '';
}

function escapeHtml(str) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
const hast = rootToHast(tree, sourceCode);
const html = hastToHtml(hast);
console.log(html);
const CppLang = await Language.load('./tree-sitter-cpp.wasm');
parser.setLanguage(CppLang);
const cppCode = readFileSync('./test.cpp', 'utf-8');
const cppTree = parser.parse(cppCode);
const cppHast = rootToHast(cppTree, cppCode);
const cppHtml = hastToHtml(cppHast);
console.log(cppHtml);

const endTime = performance.now();
console.log(`解析和生成HTML的总时间: ${(endTime - startTime).toFixed(2)} ms`);

// 输出HTML字符串，可以直接插入到网页中展示高亮后的代码
writeFile('./output.html', '忘记加样式了……<br/><pre><code>' + html + `</code></pre><pre><code>${cppHtml}</code></pre>`, (err) => {
	if (err) throw err;
	console.log('HTML文件已保存，可以看到是毫秒级别的速度！比 textmate 快多了！');
});
//*/