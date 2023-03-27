import React, {useCallback, useEffect} from 'react';
import ReactFlow, {
	MiniMap,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	addEdge, BackgroundVariant, ConnectionLineType, type OnConnect, type Node, type Edge, Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {generateHashTree} from '~/entries/devtools/utils';

import ELK, {ElkNode} from 'elkjs';

const tree = generateHashTree(3, 2);

const [initialNodes, initialEdges] = Object.entries(tree).reduce<[Node[], Edge[]]>(
	([nodes, edges], [hash, links]) => {
		nodes.push({id: hash, data: {label: hash}, position: {x: 0, y: 0}});
		links.forEach(link => edges.push({id: `${hash}-${link}`, source: hash, target: link, type: 'smoothstep', animated: true}));
		return [nodes, edges];
	}, [[], []]);

const elk = new ELK();
const elkLayout = async () => {
	const elkNodes = initialNodes.map(node => ({id: node.id, width: 150, height: 75}));
	const elkEdges = initialEdges.map(edge => ({id: edge.id, sources: [edge.source], targets: [edge.target]}));
	const layout = await elk.layout({
		id: 'root',
		layoutOptions: {
			'elk.algorithm': 'layered',
			'elk.direction': 'DOWN',
			'nodePlacement.strategy': 'SIMPLE',
		},
		children: elkNodes,
		edges: elkEdges,
	});

	return {
		nodes: layout.children?.map(node => ({id: node.id, data: {label: node.id}, position: {x: node.x ?? 0, y: node.y ?? 0}})) ?? [],
		edges: layout.edges?.map(edge => ({id: edge.id, source: edge.sources[0], target: edge.targets[0], type: 'smoothstep', animated: true})) ?? [],
	};
};

export default function App() {
	const [nodes, setNodes] = useNodesState([]);
	const [edges, setEdges] = useEdgesState([]);

	useEffect(() => {
		elkLayout().then(({nodes, edges}) => {
			setNodes(nodes);
			setEdges(edges);
		}).catch(console.error);
	}, [setNodes, setEdges]);

	const onConnect: OnConnect = useCallback(
		connection => setEdges(eds => addEdge(connection, eds)),
		[setEdges],
	);

	return (
		<div style={{width: '100vw', height: '100vh'}}>
			<ReactFlow
				proOptions={{hideAttribution: true}}
				nodes={nodes}
				edges={edges}
				onConnect={onConnect}
				connectionLineType={ConnectionLineType.SmoothStep}
			>
				<Controls />
				<MiniMap />
				<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
			</ReactFlow>
		</div>
	);
}
