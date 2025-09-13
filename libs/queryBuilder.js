export function MongoQuery(rules){
    if(!rules || rules.length ===0){
        return {};
    }
    const query={$and : []};
     rules.forEach(rule => {
    const { field, operator, value } = rule;
    const mongoOperator = operatorMap[operator];

    if (!mongoOperator) {
     
      return;
    }

    let processedValue = value;
    
    if (field === 'totalSpends' || field === 'visitCount') {
        processedValue = Number(value);
    } else if (field === 'lastSeen') {
        processedValue = new Date(value);
    }
    
    query.$and.push({ [field]: { [mongoOperator]: processedValue } });
  });

  return query;
}