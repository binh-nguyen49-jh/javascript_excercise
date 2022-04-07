const QUESTION_NODE_TYPE = 'question';
const TARGET_NODE_TYPE = 'target';

class Node {
    static idCounter = 0; // make sure all node ids are unique in runtime

    constructor(body, type = QUESTION_NODE_TYPE) {
        this.body = body;
        this.type = type;
        this.id = ++Node.idCounter;
    }
}

// Right leaf - node when the answer is YES
// Left Leaf - node when the answer is NO
// Add: O(1)
// Edit: O(n) - complexity of object.assign
// Delete: O(1)

const DecisionTree = function () {
    this.nodeMap = {};
    this.nodes = {};
    this.rootNode = null;

    this.formatId = (nodeId, isRightLeaf) => {
        return `${nodeId}_${isRightLeaf ? 'YES' : 'NO'}`;
    }

    this.add = (node, parentNodeId = null, isRightLeaf = true) => { // O(1)
        if (!node) {
            throw Error("The node must be not null");
        }
        if (!this.nodes[node.id]) {
            this.nodes[node.id] = node;
        }
        if (!parentNodeId) {
            this.rootNode = node;
        } else if (!this.nodes[parentNodeId]) {
            throw Error("Invalid parent node");
        }
        this.nodeMap[this.formatId(parentNodeId, isRightLeaf)] = node.id;
    }

    this.edit = (nodeId, newQuestion) => {
        if (!this.nodes[nodeId]) {
            throw Error("Doesn't exist this node");
        }
        Object.assign(this.nodes[nodeId], newQuestion); // O(n)
        this.nodes[nodeId].id = nodeId; // preserve id
    }

    this.editPath = (nodeId, parentNodeId, turnToRightLeaf) => {
        this.delete(parentNodeId, !turnToRightLeaf);
        return this.add(this.nodes[nodeId], parentNodeId, turnToRightLeaf);
    }

    this.delete = (nodeId, isRightLeaf) => {
        const leaf = this.nodeMap[this.formatId(nodeId, isRightLeaf)];
        if (leaf) {
            this.nodeMap[this.formatId(nodeId, isRightLeaf)] = null; // O (1)
        }
    }

    this.visualizeLeaf = (leafNodeId, isRightLeaf) => {
        if (leafNodeId) {
            console.log(
                isRightLeaf ? 'YES' : 'NO',
                this.nodes[leafNodeId].type === QUESTION_NODE_TYPE ? ':' : '---->',
                this.nodes[leafNodeId].body
            );
        }
    }

    this.visualizeHelper = (curNodeId, visited) => {
        if (curNodeId && !visited[curNodeId] && this.nodes[curNodeId].type !== TARGET_NODE_TYPE) {
            visited[curNodeId] = true;
            console.log(this.nodes[curNodeId].body);
            const rightLeafId = this.nodeMap[this.formatId(curNodeId, isRightLeaf = true)];
            const leftLeafId = this.nodeMap[this.formatId(curNodeId, isRightLeaf = false)];

            this.visualizeLeaf(rightLeafId, true);
            this.visualizeLeaf(leftLeafId, false);

            this.visualizeHelper(rightLeafId, visited);
            this.visualizeHelper(leftLeafId, visited);
        }
    }

    this.visualize = () => {
        const visited = {};
        this.visualizeHelper(this.rootNode.id, visited);
        console.log("");
    }
}

// Example: Decision Node Tree for determining whether the guest is vegetarian or not
let questionA = new Node('Did the guest eat chicken?');
let questionB = new Node('Did the guest eat beef steak?');
let questionC = new Node('Did the guest eat sea-food?');
const vegetarianTarget = new Node('Vegetarian', type = TARGET_NODE_TYPE);
const notVegetarianTarget = new Node('Not vegetarian', type = TARGET_NODE_TYPE);

let decisionTree = new DecisionTree();
decisionTree.add(questionA); // root node
decisionTree.add(notVegetarianTarget, questionA.id, isRightLeaf = true);
decisionTree.add(questionB, questionA.id, isRightLeaf = false);
decisionTree.add(notVegetarianTarget, questionB.id, isRightLeaf = true);
decisionTree.add(questionC, questionB.id, isRightLeaf = false);
decisionTree.add(notVegetarianTarget, questionC.id, isRightLeaf = true);
decisionTree.add(vegetarianTarget, questionC.id, isRightLeaf = false);
decisionTree.visualize();

decisionTree.edit(questionA.id, new Node('Did the guest eat something?'));
decisionTree.editPath(questionB.id, questionA.id, turnToRightLeaf = true);
decisionTree.add(vegetarianTarget, questionA.id, isRightLeaf = false);
decisionTree.visualize();


// Example: Decision Node Flowchart for determining whether we should do something or not
questionA = new Node('Do you want to do this?');
questionB = new Node('Will it likely end in disaster?');
questionC = new Node('Will it make a good story anyway?');

const doItTarget = new Node('Do It', TARGET_NODE_TYPE);
const dontDoItTarget = new Node('Don\'t Do It', TARGET_NODE_TYPE);

decisionTree = new DecisionTree();
decisionTree.add(questionA);
decisionTree.add(questionB, questionA.id, isRightLeaf = true);
decisionTree.add(dontDoItTarget, questionA.id, isRightLeaf = false);
decisionTree.add(questionC, questionB.id, isRightLeaf = true);
decisionTree.add(doItTarget, questionB.id, isRightLeaf = false);
decisionTree.add(doItTarget, questionC.id, isRightLeaf = true);
decisionTree.add(dontDoItTarget, questionC.id, isRightLeaf = false);
decisionTree.visualize();