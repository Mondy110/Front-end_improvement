import request from '@/utils/request'

// 获取图片列表
export function getImageList(videoId, step, page) {
  return request({
    url: `/video/imageWall/images/${videoId}`,
    method: 'get',
    params: {
      step: step,
      page: page
    }
  })
}

// 获取步长选项
export function getStepOptions() {
  return request({
    url: '/video/imageWall/steps',
    method: 'get'
  })
}