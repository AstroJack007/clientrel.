export function MongoQuery({ rules, logic, connectors = [] }) {
  if (!rules || rules.length === 0) {
    return {};
  }

  const operatorMap = {
    eq: '$eq',
    gt: '$gt',
    gte: '$gte',
    lt: '$lt',
    lte: '$lte',
    ne: '$ne'
  };

  const processRule = (rule) => {
    const { field, operator, value } = rule;
    const mongoOperator = operatorMap[operator];
    if (!mongoOperator) return null;

    let processedValue = value;
    if (field === 'totalSpends' || field === 'visitCount') {
      processedValue = Number(value);
      if (isNaN(processedValue)) return null;
    } else if (field === 'lastSeen') {
      processedValue = new Date(value);
    }

    return { [field]: { [mongoOperator]: processedValue } };
  };

  const conditions = rules.map(processRule).filter(Boolean);
  if (conditions.length === 0) return {};


  if (connectors.length === 0) {
    if (logic.toUpperCase() === 'AND') {
      return { $and: conditions };
    } else {
      return { $or: conditions };
    }
  }


  if (logic === 'MIXED') {
    let current = conditions[0];

    for (let i = 0; i < connectors.length; i++) {
      const connector = connectors[i].toUpperCase();
      const nextCondition = conditions[i + 1];
      if (!nextCondition) break;

      if (connector === 'AND') {
        current = { $and: [current, nextCondition] };
      } else {
        current = { $or: [current, nextCondition] };
      }
    }

    return current;
  }

  return {};
}
