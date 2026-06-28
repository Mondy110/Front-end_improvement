/**
 * ProTable 工具函数（从 Geeker TS 降维为纯 JS）
 */

/**
 * 生成唯一 uuid
 */
export function generateUUID() {
  let uuid = ""
  for (let i = 0; i < 32; i++) {
    let random = (Math.random() * 16) | 0
    if (i === 8 || i === 12 || i === 16 || i === 20) uuid += "-"
    uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16)
  }
  return uuid
}

/**
 * 处理 ProTable 值为数组 || 无数据
 */
export function formatValue(callValue) {
  if (Array.isArray(callValue)) return callValue.length ? callValue.join(" / ") : "--"
  return callValue ?? "--"
}

/**
 * 处理 prop 为多级嵌套的情况，返回的数据（例如: prop: user.name）
 */
export function handleRowAccordingToProp(row, prop) {
  if (!prop.includes(".")) return row[prop] ?? "--"
  prop.split(".").forEach(item => (row = row[item] ?? "--"))
  return row
}

/**
 * 处理 prop，当 prop 为多级嵌套时 ==> 返回最后一级 prop
 */
export function handleProp(prop) {
  const propArr = prop.split(".")
  if (propArr.length === 1) return prop
  return propArr[propArr.length - 1]
}

/**
 * 根据枚举列表查询需要的数据
 * @param {*} callValue  当前单元格值
 * @param {Array} enumData  字典列表
 * @param {Object} fieldNames  label && value && children 的 key 值
 * @param {String} type  过滤类型（目前只有 tag）
 */
export function filterEnum(callValue, enumData, fieldNames, type) {
  const value = fieldNames?.value ?? "value"
  const label = fieldNames?.label ?? "label"
  const children = fieldNames?.children ?? "children"
  let filterData = {}
  if (Array.isArray(enumData)) filterData = findItemNested(enumData, callValue, value, children)
  if (type === "tag") {
    return filterData?.tagType ? filterData.tagType : ""
  } else {
    return filterData ? filterData[label] : "--"
  }
}

/**
 * 递归查找 callValue 对应的 enum 值
 */
export function findItemNested(enumData, callValue, value, children) {
  return enumData.reduce((accumulator, current) => {
    if (accumulator) return accumulator
    if (current[value] === callValue) return current
    if (current[children]) return findItemNested(current[children], callValue, value, children)
  }, null)
}
