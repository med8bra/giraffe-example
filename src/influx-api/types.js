// See https://docs.influxdata.com/influxdb/v2.0/api/#operation/PostQueryAnalyze
export const DateTimeLiteral = value => ({ type: "DateTimeLiteral", value });
export const DurationLiteral = ({ magnitude, unit }) => ({ type: "DurationLiteral", values: [{ magnitude, unit }] })

export function buildQueryVariable(name, attrs) {
  return {
    type: 'file',
    package: null,
    imports: null,
    body: [{
      type: "OptionStatement",
      assignment: {
        type: "VariableAssignment",
        id: { type: "Identifier", name },
        init: {
          type: "ObjectExpression",
          properties: Object.keys(attrs).map(name => ({
            type: "Property",
            key: { type: "Identifier", name },
            value: attrs[name]
          }))
        }
      }
    }]
  };
}