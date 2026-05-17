package main

import (
	"fmt"
	"syscall/js"
)

func evaluate(this js.Value, args []js.Value) interface{} {
	expr := args[0].String()
	result := fmt.Sprintf("Got: %s", expr)
	return result
}

func main() {
	js.Global().Set("goEvaluate", js.FuncOf(evaluate))
	select {}
}
