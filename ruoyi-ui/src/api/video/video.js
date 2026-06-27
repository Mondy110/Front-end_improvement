import request from '@/utils/request'
//原版vedio
// 查询视频信息列表
export function listVideo(query) {
  return request({
    url: '/video/video/list',
    method: 'get',
    params: query
  })
}

// 查询视频信息详细
export function getVideo(id) {
  return request({
    url: '/video/video/' + id,
    method: 'get'
  })
}

// 新增视频信息
export function addVideo(data) {
  return request({
    url: '/video/video',
    method: 'post',
    data: data
  })
}

// 修改视频信息
export function updateVideo(data) {
  return request({
    url: '/video/video',
    method: 'put',
    data: data
  })
}

// 删除视频信息
export function delVideo(id) {
  return request({
    url: '/video/video/' + id,
    method: 'delete'
  })
}

// 查询视频信息列表
export function listVideoln(query) {
  return request({
    url: '/video/videoln/list',
    method: 'get',
    params: query
  })
}

// 查询视频信息详细
export function getVideoln(id) {
  return request({
    url: '/video/videoln/' + id,
    method: 'get'
  })
}

// 新增视频信息
export function addVideoln(data) {
  return request({
    url: '/video/videoln',
    method: 'post',
    data: data
  })
}

// 修改视频信息
export function updateVideoln(data) {
  return request({
    url: '/video/videoln',
    method: 'put',
    data: data
  })
}

// 删除视频信息
export function delVideoln(id) {
  return request({
    url: '/video/videoln/' + id,
    method: 'delete'
  })
}

export function getAnalysisResult(id) {
  return request({
    // TODO: 请将这个 URL 替换成您后端真实提供数据的接口地址！
    url: '/video/videoln/analysis/' + id, 
    method: 'get'
  })
}

export function getFrameInfo(id) {
  return request({
    // 确保这个 URL 和您后端 Controller 中定义的 @GetMapping 路径完全一致
    url: '/video/videoln/frame-info/' + id,
    method: 'get'
  })
}

// 查询所有科目信息列表
export function listAllSubject(query) {
  return request({
    url: '/subject/subject/listAll',
    method: 'get',
    params: query
  })
}

// 查询所有考试分组列表
export function listAllExamGroup(query) {
  return request({
    url: '/group/group/listAll',
    method: 'get',
    params: query
  })
}

// 视频上传
export function uploadVideo(data, onUploadProgress) {
  return request({
    url: '/video/video/upload',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data,
    timeout: 60000,
    onUploadProgress: onUploadProgress
  })
}

// 上传文件分片
export function uploadChunk(data,fileId,chunkIndex) {
  return request({
    url: '/video/video/chunk/' +fileId + '/'+ chunkIndex,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}

// 查询已上传分片
export function getStatus(query) {
  return request({
    url: '/video/video/status',
    method: 'get',
    params: query
  })
}

// 合并文件分片
export function mergeChunks(data,fileId) {
  return request({
    url: '/video/video/merge/'+fileId,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}

export function predict(data,videoId) {
  return request({
    url: '/video/video/predict/'+videoId,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  });
}

// 删除视频文件
export function deleteVideoFile(id) {
  return request({
    url: '/video/video/file/' + id,
    method: 'delete'
  })
}
