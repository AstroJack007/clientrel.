export function MongoQuery(rules, connectors) {
 
  if (!rules || rules.length === 0) {
    return {};
  }

  const toMongoCondition = (rule) => {
    const operatorMap = {
      eq: '$eq',
      gt: '$gt',
      gte: '$gte',
      lt: '$lt',
      lte: '$lte',
      ne: '$ne',
    };
    const { field, operator, value } = rule || {};
    const mongoOperator = operatorMap[operator];
    if (!field || !mongoOperator) return null;

    let processedValue = value;
    if (field === 'totalSpends' || field === 'visitCount') {
      processedValue = Number(value);
    } else if (field === 'lastSeen') {
      processedValue = new Date(value);
    }
    return { [field]: { [mongoOperator]: processedValue } };
  };


  const conditions = rules
    .map(toMongoCondition)
    .filter(Boolean);

  if (conditions.length === 0) return {};

  if (conditions.length === 1) return conditions[0];

  const joins = Array.isArray(connectors)
    ? connectors.map((c) => (typeof c === 'string' ? c.toUpperCase() : 'AND'))
    : [];
  while (joins.length < conditions.length - 1) joins.push('AND');

  const groups = [];
  let currentGroup = [];

  for (let i = 0; i < conditions.length; i++) {
    currentGroup.push(conditions[i]);
    const isLast = i === conditions.length - 1;
    const join = isLast ? null : joins[i];
    if (isLast || join === 'OR') {
      
      if (currentGroup.length === 1) {
        groups.push(currentGroup[0]);
      } else {
        groups.push({ $and: currentGroup });
      }
      currentGroup = [];
    }
  }

  if (groups.length === 1) {
  
    return typeof groups[0] === 'object' ? groups[0] : {};
  }
  return { $or: groups };
}