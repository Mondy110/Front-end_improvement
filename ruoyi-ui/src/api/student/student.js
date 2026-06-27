import request from '@/utils/request'

// ----------------------------------------------------------------------------------
// 为什么需要设置 API 文件？
// 1.  **代码组织和解耦**：将所有与后端 "学生信息" 相关的接口请求都集中在这个文件中。
//     这样，前端的页面组件（Vue 文件）就不需要关心具体的请求 URL、请求方法（GET/POST等）和参数格式。
//     页面组件只需要调用这里定义的函数（如 `listStudent`），就能获取数据，实现了业务逻辑和网络请求逻辑的分离。
// 2.  **可维护性**：如果后端的接口地址变了，我们只需要修改这个文件里的 URL，而不需要去修改所有用到这个接口的页面组件。
// 3.  **可复用性**：如果多个页面都需要查询学生列表，它们都可以调用同一个 `listStudent` 函数，避免了代码重复。
// 4.  **统一处理**：所有请求都使用了 `utils/request.js` 中封装好的 `request` 实例。
//     这个 `request` 实例会统一处理一些公共逻辑，比如：
//     -   自动在请求头中添加认证信息（Token）。
//     -   统一处理请求超时、网络错误等异常情况。
//     -   统一处理后端返回的特定状态码（如 401 未授权，会弹出提示并跳转到登录页）。
//     这极大地简化了每个具体请求的编码工作。
// ----------------------------------------------------------------------------------


/**
 * @description 查询学生信息列表
 * @param {object} query - 查询参数，通常包含分页信息（如 pageNum, pageSize）和过滤条件（如 studentName, status 等）。
 * @returns {Promise} 返回一个 Promise 对象，成功时会 resolve 后端返回的数据。
 */
export function listStudent(query) {
  return request({
    url: '/student/student/list',
    method: 'get',
    params: query
  })
}

/**
 * @description 根据学生 ID 查询学生详细信息
 * @param {number|string} id - 学生的唯一标识 ID。
 * @returns {Promise}
 */
export function getStudent(id) {
  return request({
    url: '/student/student/' + id,
    method: 'get'
  })
}

/**
 * @description 新增一个学生信息
 * @param {object} data - 包含学生信息的对象，将作为请求体发送给后端。
 * @returns {Promise}
 */
export function addStudent(data) {
  return request({
    url: '/student/student',
    method: 'post',
    data: data
  })
}

/**
 * @description 修改一个已有的学生信息
 * @param {object} data - 包含要修改的学生信息的对象，其中必须包含学生的 ID。
 * @returns {Promise}
 */
export function updateStudent(data) {
  return request({
    url: '/student/student',
    method: 'put',
    data: data
  })
}

/**
 * @description 根据学生 ID 删除学生信息
 * @param {number|string} id - 要删除的学生的唯一标识 ID。
 * @returns {Promise}
 */
export function delStudent(id) {
  return request({
    url: '/student/student/' + id,
    method: 'delete'
  })
}
