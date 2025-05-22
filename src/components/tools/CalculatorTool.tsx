
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";

const CalculatorTool = () => {
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  
  const [display, setDisplay] = useState<string>("0");
  const [currentNumber, setCurrentNumber] = useState<string>("0");
  const [operation, setOperation] = useState<string | null>(null);
  const [previousNumber, setPreviousNumber] = useState<string | null>(null);
  const [calculatorMode, setCalculatorMode] = useState<"basic" | "scientific">("basic");
  const [calculated, setCalculated] = useState<boolean>(false);

  const handleNumberClick = (num: string) => {
    if (calculated) {
      setDisplay(num);
      setCurrentNumber(num);
      setCalculated(false);
      return;
    }
    
    if (currentNumber === "0" || display === "Error") {
      setDisplay(num);
      setCurrentNumber(num);
    } else {
      setDisplay(display + num);
      setCurrentNumber(currentNumber + num);
    }
  };

  const handleOperationClick = (op: string) => {
    if (display === "Error") return;
    
    if (previousNumber && operation && !calculated) {
      // Continue calculation
      try {
        const result = calculate(
          parseFloat(previousNumber),
          parseFloat(currentNumber),
          operation
        ).toString();
        
        setDisplay(result);
        setPreviousNumber(result);
        setCurrentNumber("0");
        setOperation(op);
      } catch (error) {
        setDisplay("Error");
        resetCalculator();
      }
    } else {
      setPreviousNumber(display);
      setCurrentNumber("0");
      setOperation(op);
      setCalculated(false);
    }
  };

  const handleEqualsClick = () => {
    if (display === "Error" || !previousNumber || !operation) return;
    
    try {
      const result = calculate(
        parseFloat(previousNumber),
        parseFloat(currentNumber),
        operation
      ).toString();
      
      setDisplay(result);
      setPreviousNumber(null);
      setCurrentNumber(result);
      setOperation(null);
      setCalculated(true);
    } catch (error) {
      setDisplay("Error");
      resetCalculator();
    }
  };

  const calculate = (num1: number, num2: number, op: string): number => {
    switch (op) {
      case "+":
        return num1 + num2;
      case "-":
        return num1 - num2;
      case "×":
        return num1 * num2;
      case "÷":
        if (num2 === 0) throw new Error("Division by zero");
        return num1 / num2;
      case "%":
        return num1 % num2;
      case "^":
        return Math.pow(num1, num2);
      default:
        return 0;
    }
  };

  const handleDecimalClick = () => {
    if (calculated) {
      setDisplay("0.");
      setCurrentNumber("0.");
      setCalculated(false);
      return;
    }
    
    if (!currentNumber.includes(".")) {
      setDisplay(display + ".");
      setCurrentNumber(currentNumber + ".");
    }
  };

  const handleBackspaceClick = () => {
    if (display === "Error" || display === "0" || calculated) return;
    
    const newDisplay = display.slice(0, -1) || "0";
    const newCurrentNumber = currentNumber.slice(0, -1) || "0";
    
    setDisplay(newDisplay);
    setCurrentNumber(newCurrentNumber);
  };

  const resetCalculator = () => {
    setDisplay("0");
    setCurrentNumber("0");
    setPreviousNumber(null);
    setOperation(null);
    setCalculated(false);
  };
  
  const handleScientificFunction = (func: string) => {
    if (display === "Error") return;
    
    try {
      let result = 0;
      const num = parseFloat(display);
      
      switch (func) {
        case "sin":
          result = Math.sin(num);
          break;
        case "cos":
          result = Math.cos(num);
          break;
        case "tan":
          result = Math.tan(num);
          break;
        case "log":
          result = Math.log10(num);
          break;
        case "ln":
          result = Math.log(num);
          break;
        case "sqrt":
          result = Math.sqrt(num);
          break;
        case "square":
          result = Math.pow(num, 2);
          break;
        case "1/x":
          if (num === 0) throw new Error("Division by zero");
          result = 1 / num;
          break;
      }
      
      const resultStr = result.toString();
      setDisplay(resultStr);
      setCurrentNumber(resultStr);
      setCalculated(true);
      
    } catch (error) {
      setDisplay("Error");
      resetCalculator();
    }
  };

  return (
    <div>
      <Tabs value={calculatorMode} onValueChange={(v) => setCalculatorMode(v as any)} className="mb-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="basic">{isArabic ? "أساسية" : "Basic"}</TabsTrigger>
          <TabsTrigger value="scientific">{isArabic ? "علمية" : "Scientific"}</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card className="p-4 max-w-[300px] mx-auto">
        <div className="bg-background border rounded-lg p-4 mb-4 text-right text-2xl font-mono h-16 flex items-center justify-end overflow-hidden">
          {display}
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={resetCalculator}>C</Button>
          <Button variant="outline" onClick={handleBackspaceClick}>←</Button>
          <Button variant="outline" onClick={() => handleOperationClick("%")}>%</Button>
          <Button variant="outline" onClick={() => handleOperationClick("÷")}>÷</Button>
          
          <Button onClick={() => handleNumberClick("7")}>7</Button>
          <Button onClick={() => handleNumberClick("8")}>8</Button>
          <Button onClick={() => handleNumberClick("9")}>9</Button>
          <Button variant="outline" onClick={() => handleOperationClick("×")}>×</Button>
          
          <Button onClick={() => handleNumberClick("4")}>4</Button>
          <Button onClick={() => handleNumberClick("5")}>5</Button>
          <Button onClick={() => handleNumberClick("6")}>6</Button>
          <Button variant="outline" onClick={() => handleOperationClick("-")}>-</Button>
          
          <Button onClick={() => handleNumberClick("1")}>1</Button>
          <Button onClick={() => handleNumberClick("2")}>2</Button>
          <Button onClick={() => handleNumberClick("3")}>3</Button>
          <Button variant="outline" onClick={() => handleOperationClick("+")}>+</Button>
          
          <Button onClick={() => handleNumberClick("0")}>0</Button>
          <Button onClick={handleDecimalClick}>.</Button>
          <Button
            className="col-span-2"
            onClick={handleEqualsClick}
          >
            =
          </Button>
        </div>
        
        {calculatorMode === "scientific" && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            <Button variant="secondary" onClick={() => handleScientificFunction("sin")}>sin</Button>
            <Button variant="secondary" onClick={() => handleScientificFunction("cos")}>cos</Button>
            <Button variant="secondary" onClick={() => handleScientificFunction("tan")}>tan</Button>
            <Button variant="outline" onClick={() => handleOperationClick("^")}>x^y</Button>
            
            <Button variant="secondary" onClick={() => handleScientificFunction("log")}>log</Button>
            <Button variant="secondary" onClick={() => handleScientificFunction("ln")}>ln</Button>
            <Button variant="secondary" onClick={() => handleScientificFunction("sqrt")}>√</Button>
            <Button variant="secondary" onClick={() => handleScientificFunction("square")}>x²</Button>
            
            <Button 
              variant="secondary" 
              onClick={() => handleScientificFunction("1/x")}
              className="col-span-2"
            >
              1/x
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                const num = parseFloat(display);
                setDisplay((num * -1).toString());
                setCurrentNumber((num * -1).toString());
              }}
              className="col-span-2"
            >
              ±
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CalculatorTool;
