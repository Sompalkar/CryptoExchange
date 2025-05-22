package models

import (
	"container/heap"
)

// OrderHeap implements heap.Interface for Order
// It can be used for both buy and sell orders
type OrderHeap []*Order

// Len returns the number of orders in the heap
func (h OrderHeap) Len() int { return len(h) }

// Less compares two orders based on their price
// For buy orders: higher price has higher priority
// For sell orders: lower price has higher priority
func (h OrderHeap) Less(i, j int) bool {
	if h[i].Type == OrderTypeBuy {
		return h[i].Price > h[j].Price // Buy orders: higher price first
	}
	return h[i].Price < h[j].Price // Sell orders: lower price first
}

// Swap swaps two orders in the heap
func (h OrderHeap) Swap(i, j int) {
	h[i], h[j] = h[j], h[i]
}

// Push adds a new order to the heap
func (h *OrderHeap) Push(x interface{}) {
	*h = append(*h, x.(*Order))
}

// Pop removes and returns the highest priority order
func (h *OrderHeap) Pop() interface{} {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[0 : n-1]
	return x
}

// Peek returns the highest priority order without removing it
func (h OrderHeap) Peek() *Order {
	if h.Len() == 0 {
		return nil
	}
	return h[0]
}

// Remove removes a specific order from the heap
func (h *OrderHeap) Remove(order *Order) {
	for i, o := range *h {
		if o.ID == order.ID {
			heap.Remove(h, i)
			return
		}
	}
}
