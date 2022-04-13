const fs = require('fs');

const QUESTION_NODE_TYPE = 'question';
const TARGET_NODE_TYPE = 'target';

class Node {
    static idCounter = 0;
    constructor(body, type = QUESTION_NODE_TYPE) {
        this.body = body;
        this.type = type;
        this.id = ++Node.idCounter;
    }
}

const NodeFactory = (nodeData) => {
    if (nodeData.type == TARGET_NODE_TYPE) {
        return new Node(nodeData.body, TARGET_NODE_TYPE);
    } else {
        return new Node(nodeData.body, QUESTION_NODE_TYPE);
    }
}

// Add: O(1)
// Edit: O(n) - complexity of object.assign
// Delete: O(1)

// read tree from json file 
// not binary tree

const DecisionTree = function () {
    this.nodeMap = {}; // parentId - pair<parentId_childId,content>
    this.nodes = {};
    this.rootNode = null;
    this.nodeFactory = NodeFactory;

    this.formatId = (nodeId, childOrder) => {
        return `${nodeId}_${childOrder}`;
    }

    this.add = (node) => { // O(1)
        if (!node) {
            throw Error("The node must be not null");
        }
        if (!this.nodes[node.id]) {
            this.nodes[node.id] = node;
            this.nodeMap[node.id] = new Map();
        }
        if(this.rootNode == null) {
            this.rootNode = node;
        }
    }

    this.addPath = (parentNodeId, childNodeId, pathContent) => {
        if (!parentNodeId) {
            throw Error("Invalid parent node ID");
        } else if (!this.nodes[parentNodeId]) {
            throw Error("Invalid parent node");
        } else {
            this.nodeMap[parentNodeId].set(this.formatId(parentNodeId, childNodeId), pathContent);
        }
    }

    this.edit = (nodeId, newQuestion) => {
        if (!this.nodes[nodeId]) {
            throw Error("Doesn't exist this node");
        }
        Object.assign(this.nodes[nodeId], newQuestion); // O(n)
        this.nodes[nodeId].id = nodeId; // preserve id
    }

    this.editPath = (parentNodeId, nodeId, newPathContent) => {
        this.deletePath(parentNodeId, nodeId);
        return this.addPath(parentNodeId, this.nodes[nodeId].id, newPathContent);
    }

    this.deletePath = (parentNodeId, childNodeId) => {
        if (this.nodeMap[parentNodeId].has(this.formatId(parentNodeId, childNodeId))) {
            this.nodeMap[parentNodeId].delete(this.formatId(parentNodeId, childNodeId)); // O (1)
        }
    }

    this.visualizePath = (parentId, nodeId) => {
        if (parentId === null) {
            return '';
        }
        const path = this.nodeMap[parentId].get(this.formatId(parentId, nodeId));
        if (path) {
            return path.body;
        }
        return '';
    }
    this.visualizeLeaf = (node, parentId = null) => {
        console.log(this.visualizePath(parentId, node.id), node.type === QUESTION_NODE_TYPE ? ' ' : '--->', node.body);
    }

    this.visualizeHelper = (curNodeId, visited) => {
        if (curNodeId && !visited[curNodeId] && this.nodes[curNodeId].type !== TARGET_NODE_TYPE) {
            visited[curNodeId] = true;
            this.visualizeLeaf(this.nodes[curNodeId]);

            const paths = Array.from(this.nodeMap[curNodeId].keys());
            for (let path of paths) {
                const childNodeId = path.split('_')[1]; // parentId_childId
                this.visualizeLeaf(this.nodes[childNodeId], curNodeId);
            }

            for (let path of paths) {
                const childNodeId = path.split('_')[1]; // parentId_childId
                this.visualizeHelper(childNodeId, visited);
            }
        }
    }

    this.visualize = () => {
        const visited = {};
        this.visualizeHelper(this.rootNode.id, visited);
        console.log("");
    }

    this.fromFile = (fileName) => {
        const rawData = fs.readFileSync(fileName);
        const nodes = JSON.parse(rawData)['nodes'];
        const nodeInstanceMap = {}; //pair<nodeIdInFile, nodeInTree>

        // Re-initialize properties
        this.nodeMap = {}; // parentId - pair<parentId_childId,content>
        this.nodes = {};
        this.rootNode = null;

        for(let nodeId of Object.keys(nodes)) {
            const nodeInstance = nodeInstanceMap[nodeId]? nodeInstanceMap[nodeId] : this.nodeFactory(nodes[nodeId]);
            if (!nodeInstanceMap[nodeId]) {
                this.add(nodeInstance);
                nodeInstanceMap[nodeId] = nodeInstance.id;
            }
            if (nodes[nodeId]['answers']) {
                for (let path of nodes[nodeId]['answers']) {
                    const childNodeId = path['next_node'];
                    const childNodeInstance = nodeInstanceMap[childNodeId]? nodeInstanceMap[childNodeId] : this.nodeFactory(nodes[childNodeId]);
                    if (!nodeInstanceMap[childNodeId]) {
                        this.add(childNodeInstance);
                        nodeInstanceMap[childNodeId] = childNodeInstance.id;
                    }
                    this.addPath(nodeInstanceMap[nodeId], nodeInstanceMap[childNodeId], path);
                }
            }
        }
        return this;
    }

    this.fromNodeFactory = (factory) => {
        this.nodeFactory = factory;
    }
}

// Example: Decision Node Tree for determining whether the guest is vegetarian or not
const questionA = new Node('Did the guest eat chicken?');
const questionB = new Node('Did the guest eat beef steak?');
const questionC = new Node('Did the guest eat sea-food?');

const vegetarianTarget = new Node('Vegetarian', type = TARGET_NODE_TYPE);
const notVegetarianTarget = new Node('Not vegetarian', type = TARGET_NODE_TYPE);

const decisionTree = new DecisionTree();
decisionTree.add(questionA); // root node
decisionTree.add(questionB);
decisionTree.add(questionC);
decisionTree.add(notVegetarianTarget);
decisionTree.add(vegetarianTarget);
decisionTree.addPath(questionA.id, notVegetarianTarget.id, {body: 'YES'});
decisionTree.addPath(questionA.id, questionB.id, {body: 'NO'});
decisionTree.addPath(questionB.id, notVegetarianTarget.id, {body: 'YES'});
decisionTree.addPath(questionB.id, questionC.id, {body: 'NO'});
decisionTree.addPath(questionC.id, notVegetarianTarget.id, {body: 'YES'});
decisionTree.addPath(questionC.id, vegetarianTarget.id, {body: 'NO'});
decisionTree.visualize();

decisionTree.edit(questionA.id, new Node('Did the guest eat something?'));
decisionTree.editPath(questionA.id, questionB.id, {body: 'YES'});
decisionTree.deletePath(questionA.id, notVegetarianTarget.id);
decisionTree.addPath(questionA.id, vegetarianTarget.id, {body: 'NO'});
decisionTree.visualize();

// Example: Decision Node Flowchart for determining whether we should do something or not
const decisionTreeToDo = new DecisionTree().fromFile('tree.json');
decisionTreeToDo.visualize();