// Generate a fake hash tree

type TreeNode = string;

type HashTree = Record<TreeNode, TreeNode[]>;

function generateHash(): TreeNode {
	return Math.random().toString(36).substring(2, 15);
}

export function generateHashTree(depth: number, width: number): HashTree {
	const tree: HashTree = {};
	const leafNodes = width ** depth;
	for (let i = 0; i < leafNodes; i++) {
		tree[generateHash()] = [];
	}

	let nodes = Object.keys(tree);
	for (let i = 0; i < depth; i++) {
		const newNodes: string[] = [];
		for (let j = 0; j < nodes.length; j += width) {
			const node = generateHash();
			newNodes.push(node);
			tree[node] = nodes.slice(j, j + width);
		}

		nodes = newNodes;
	}

	return tree;
}
