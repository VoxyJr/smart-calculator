package main

import (
	"fmt"
	"strconv"
	"strings"
	"syscall/js"
)

func evaluate(this js.Value, args []js.Value) interface{} {
	expr := strings.ReplaceAll(args[0].String(), " ", "")
	result, err := calc(expr)
	if err != nil {
		return "Error: " + err.Error()
	}
	return fmt.Sprintf("%g", result)
}

func calc(expr string) (float64, error) {
	// Find + or - (lowest precedence, right to left)
	for i := len(expr) - 1; i >= 0; i-- {
		if expr[i] == '+' && i > 0 {
			l, err := calc(expr[:i])
			if err != nil { return 0, err }
			r, err := calc(expr[i+1:])
			if err != nil { return 0, err }
			return l + r, nil
		}
		if expr[i] == '-' && i > 0 {
			l, err := calc(expr[:i])
			if err != nil { return 0, err }
			r, err := calc(expr[i+1:])
			if err != nil { return 0, err }
			return l - r, nil
		}
	}
	// Find * or /
	for i := len(expr) - 1; i >= 0; i-- {
		if expr[i] == '*' {
			l, err := calc(expr[:i])
			if err != nil { return 0, err }
			r, err := calc(expr[i+1:])
			if err != nil { return 0, err }
			return l * r, nil
		}
		if expr[i] == '/' {
			l, err := calc(expr[:i])
			if err != nil { return 0, err }
			r, err := calc(expr[i+1:])
			if err != nil { return 0, err }
			return l / r, nil
		}
	}
	return strconv.ParseFloat(expr, 64)
}

func main() {
	js.Global().Set("goEvaluate", js.FuncOf(evaluate))
	select {}
}
