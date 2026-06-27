import request from '@/utils/request'

// 查询学生学科考试关联列表
export function listAssociation(query) {
  return request({
    url: '/exam/association/list',
    method: 'get',
    params: query
  })
}

// 查询学生学科考试关联详细
export function getAssociation(id) {
  return request({
    url: '/exam/association/' + id,
    method: 'get'
  })
}

// 新增学生学科考试关联
export function addAssociation(data) {
  return request({
    url: '/exam/association',
    method: 'post',
    data: data
  })
}



// 批量关联学生与学科和考试分组
export function batchAssociate(data) {
  return request({
    url: '/exam/association/batch-association',
    method: 'post',
    data: data
  })
}

// 修改学生学科考试关联
export function updateAssociation(data) {
  return request({
    url: '/exam/association',
    method: 'put',
    data: data
  })
}

// 删除学生学科考试关联
export function delAssociation(id) {
  return request({
    url: '/exam/association/' + id,
    method: 'delete'
  })
}

// 获取所有学生列表
export function getAllStudents() {
  return request({
    url: '/exam/association/students',
    method: 'get'
  })
}

// 获取所有学科列表
export function getAllSubjects() {
  return request({
    url: '/exam/association/subjects',
    method: 'get'
  })
}

// 获取所有考试分组列表
export function getAllGroups() {
  return request({
    url: '/exam/association/groups',
    method: 'get'
  })
}