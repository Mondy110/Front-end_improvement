import { reactive, computed, toRefs } from "vue"

/**
 * 表格页面操作方法封装（适配若依后端分页格式）
 * @param {Function} api        获取表格数据的 api 方法（必传）
 * @param {Object}   initParam  获取数据初始化参数（非必传，默认为 {}）
 * @param {Boolean}  isPageable 是否有分页（非必传，默认为 true）
 * @param {Function} dataCallBack 对后台返回的数据进行处理的方法（非必传）
 * @param {Function} requestError 请求错误回调（非必传）
 */
export function useTable(api, initParam = {}, isPageable = true, dataCallBack, requestError) {
  const state = reactive({
    // 表格数据
    tableData: [],
    // 分页数据（若依格式：pageNum / pageSize / total）
    pageable: {
      pageNum: 1,
      pageSize: 10,
      total: 0
    },
    // 查询参数（只包括查询）
    searchParam: {},
    // 初始化默认的查询参数
    searchInitParam: {},
    // 总参数（包含分页和查询参数）
    totalParam: {}
  })

  /**
   * 分页查询参数
   */
  const pageParam = computed(() => {
    return {
      pageNum: state.pageable.pageNum,
      pageSize: state.pageable.pageSize
    }
  })

  /**
   * 获取表格数据
   * 适配若依后端响应格式：{ rows: [], total: number, code: 200 }
   */
  const getTableList = async () => {
    if (!api) return
    try {
      // 先把初始化参数和分页参数放到总参数里面
      Object.assign(state.totalParam, initParam, isPageable ? pageParam.value : {})
      const params = { ...state.searchInitParam, ...state.totalParam }
      let data = await api(params)

      // 若依 request.js 拦截器已解包 code，直接拿到 rows/total
      // dataCallBack 可进一步转换数据
      if (dataCallBack) {
        data = dataCallBack(data)
      }

      if (isPageable) {
        // 若依标准格式：{ rows: [], total: number }
        state.tableData = data.rows || data.list || data
        state.pageable.total = data.total ?? 0
      } else {
        state.tableData = data.rows || data.list || data
      }
    } catch (error) {
      requestError && requestError(error)
    }
  }

  /**
   * 更新查询参数（过滤空值）
   */
  const updatedTotalParam = () => {
    state.totalParam = {}
    const nowSearchParam = {}
    for (const key in state.searchParam) {
      // 某些情况下参数为 false/0 也应该携带参数
      if (state.searchParam[key] || state.searchParam[key] === false || state.searchParam[key] === 0) {
        nowSearchParam[key] = state.searchParam[key]
      }
    }
    Object.assign(state.totalParam, nowSearchParam)
  }

  /**
   * 表格数据查询
   */
  const search = () => {
    state.pageable.pageNum = 1
    updatedTotalParam()
    getTableList()
  }

  /**
   * 表格数据重置
   */
  const reset = () => {
    state.pageable.pageNum = 1
    state.searchParam = { ...state.searchInitParam }
    updatedTotalParam()
    getTableList()
  }

  /**
   * 每页条数改变
   * @param {Number} val 当前条数
   */
  const handleSizeChange = (val) => {
    state.pageable.pageNum = 1
    state.pageable.pageSize = val
    getTableList()
  }

  /**
   * 当前页改变
   * @param {Number} val 当前页
   */
  const handleCurrentChange = (val) => {
    state.pageable.pageNum = val
    getTableList()
  }

  return {
    ...toRefs(state),
    getTableList,
    search,
    reset,
    handleSizeChange,
    handleCurrentChange,
    updatedTotalParam
  }
}
