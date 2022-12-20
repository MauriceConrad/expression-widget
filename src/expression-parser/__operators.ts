export type Operator = {
  str: string;
  level?: number;
}
const operators: { operators: Operator[]; getByLevel: (level: number) => Operator[]; toRegExp: (operators: Operator[]) => RegExp; } = {
  operators: [
    {
      str: "+",
      level: 0
    },
    {
      str: "-",
      level: 0
    },
    {
      str: "*",
      level: 1
    },
    {
      str: "/",
      level: 1
    },
    {
      str: "/",
      level: 1
    }
  ],
  getByLevel(level = 0) {
    return this.operators.filter(op => op.level === level);
  },
  toRegExp(operators) {
    return new RegExp("[" + operators.map(op => "\\" + op.str).join("|") + "]");
  }
};

export default operators;
