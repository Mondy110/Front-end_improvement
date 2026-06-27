import request from '@/utils/request'

// 查询考试分组列表
export function listGroup(query) {
  return request({
    url: '/group/group/list',
    method: 'get',
    params: query
  })
}

// 查询考试分组详细
export function getGroup(id) {
  return request({
    url: '/group/group/' + id,
    method: 'get'
  })
}

// 新增考试分组
export function addGroup(data) {
  return request({
    url: '/group/group',
    method: 'post',
    data: data
  })
}

// 修改考试分组
export function updateGroup(data) {
  return request({
    url: '/group/group',
    method: 'put',
    data: data
  })
}

// 删除考试分组
export function delGroup(id) {
  return request({
    url: '/group/group/' + id,
    method: 'delete'
  })
}
