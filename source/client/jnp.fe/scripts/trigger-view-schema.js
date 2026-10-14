var ObservableSchemaOpen = (initialValue) => {
  let value = initialValue;
  let subscribers = [];

  const subscribe = (subscriber) => {
    subscribers.push(subscriber);
    if(value !== undefined){
      subscriber(value);
    }
  }

  const unsubscribe = (subscriber) => { 
    subscribers = subscribers.filter(fn=>fn!==subscriber);
    return subscribers.length;
  }

  const update = (updater) => {
    // we store the value as it is, and then we update.
    value = typeof updater === 'function' ?
      updater(value) :
      updater;

    // next, we call each subscriber function with both!
    subscribers?.forEach((subscriber)=>subscriber(value))
  }

  return Object.freeze({
    get value(){ return value; },
    update,
    subscribe,
    unsubscribe,
  })
}

// Dung cho form du thao
var observableSchemaDuThao = ObservableSchemaOpen()
function triggerViewSchema(FormId, hsId) {
  observableSchemaDuThao.update({ FormId, hsId })
}

// Dung cho to khai dien tu
var observableSchemaToKhaiDienTu = ObservableSchemaOpen()
async function triggerViewToKhaiDienTu({
  tthcId,
}) {
  observableSchemaToKhaiDienTu.update({
    tthcId
  })
}