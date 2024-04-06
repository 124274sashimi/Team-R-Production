import { GraphNode } from "./graph.ts";

 
/**
 * A class that describes a minimum heap data structure
 */
class minHeap {
  //functions will operate on these two arrays in parallel
  public nodeheap: Array<GraphNode> = new Array<GraphNode>();
  public weightheap: Array<number> = new Array<number>();

  public constructor(nodeheap: Array<GraphNode>, weightheap: Array<number>) {
    this.weightheap = weightheap;
    this.nodeheap = nodeheap;
  }

  // Public methods
   
  /**
   * Insert: inserts a node at the next available space, then sorts it in the minheap
   * @param node
   * @param weight
   */
  public insert(node: GraphNode, weight: number): void {
    //adds weight and node to their respetive graphs
    this.weightheap.push(weight);
    this.nodeheap.push(node);

    if (this.weightheap.length > 1) {
      //if the element inserted isnt the first
      let currentIndex = this.weightheap.length - 1; //starts at end of heap

      while (
        currentIndex > 0 &&
        this.weightheap[Math.floor((currentIndex - 1) / 2)] >
          this.weightheap[currentIndex]
      ) {
        //(currentIndex - 1) / 2) is how to get from and index to its parent in a heap
        this.swapIndex(Math.floor((currentIndex - 1) / 2), currentIndex);
        currentIndex = Math.floor((currentIndex - 1) / 2);
      }
    }
  }

  /**
   * swapIndex: helper function to swap two numbers in a both heaps
   * @param a first node to be swapped
   * @param b second node to be swapped
   */
  private swapIndex = (a: number, b: number) => {
    [this.nodeheap[a], this.nodeheap[b]] = [this.nodeheap[b], this.nodeheap[a]];
    [this.weightheap[a], this.weightheap[b]] = [
      this.weightheap[b],
      this.weightheap[a],
    ];
  };

  /**
   * delete: deletes the requested node and then adjusts the heap accordingly
   * @param node the node to be deleted
   */
  delete(node: GraphNode) {
    let i = -1;
    while (node != this.nodeheap[i]) {
      i++;
      if (i > this.nodeheap.length) {
        break;
      }
    }

    //delete first node and replace it with last node
    this.weightheap[i] = this.weightheap[this.weightheap.length - 1];
    this.weightheap.splice(this.weightheap.length - 1, 1);

    this.nodeheap[i] = this.nodeheap[this.nodeheap.length - 1];
    this.nodeheap.splice(this.nodeheap.length - 1, 1);

    let parent = 0;
    let leftChildIndex = 2 * parent + 1;
    let rightChildIndex = 2 * parent + 2;
    let left =
      leftChildIndex > this.weightheap.length
        ? null
        : this.weightheap[leftChildIndex];
    let right =
      rightChildIndex > this.weightheap.length
        ? null
        : this.weightheap[rightChildIndex];
    do {
      // no children
      if (!left && !right) {
        return;
      }

      // 1 child
      else if (!right && left && this.weightheap[parent] > left) {
        this.swapIndex(parent, leftChildIndex);
        parent = leftChildIndex;
      }

      // 2 children
      else if (left && right) {
        if (left < right && this.weightheap[parent] > left) {
          this.swapIndex(parent, leftChildIndex);
          parent = leftChildIndex;
        } else if (left > right && this.weightheap[parent] > right) {
          this.swapIndex(parent, rightChildIndex);
          parent = rightChildIndex;
        }
      }

      leftChildIndex = 2 * parent + 1;
      rightChildIndex = 2 * parent + 2;
      left =
        leftChildIndex > this.weightheap.length
          ? null
          : this.weightheap[leftChildIndex];
      right =
        rightChildIndex > this.weightheap.length
          ? null
          : this.weightheap[rightChildIndex];
    } while (
      left &&
      right &&
      (this.weightheap[parent] > left || this.weightheap[parent] > right)
    );
    //While data structure is not a heap
  }

  /**
   * peek: Returns the value at the top but does not remove it
   */
  peek(): GraphNode {
    return this.nodeheap[0];
  }

  /**
   * Returns the value at the top AND removes it
   */
  pop(): GraphNode {
    const r = this.nodeheap[0];
    delete this.nodeheap[0];
    return r;
  }
   
}

export default minHeap;
