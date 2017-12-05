class Queue {
    constructor(arr) {
        this.elements = typeof arr === 'undefined' ? [] : arr;
    }

    enqueue(e) {
        this.elements.push(e);
    }

    dequeue() {
        return this.elements.shift();
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    peek() {
        return this.elements[0];
    }
}
