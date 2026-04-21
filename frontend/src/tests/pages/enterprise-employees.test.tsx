import { render, screen } from '@testing-library/react';
import EmployeesPage from '@/app/enterprise/employees/page';

describe('EmployeesPage 企业员工管理测试', () => {
  describe('页面标题测试', () => {
    test('渲染员工管理标题', () => {
      render(<EmployeesPage />);
      const title = screen.getByText('员工管理');
      expect(title).toBeInTheDocument();
    });

    test('渲染页面描述', () => {
      render(<EmployeesPage />);
      const description = screen.getByText(/管理企业内部账号、权限分配及登录状态/);
      expect(description).toBeInTheDocument();
    });
  });

  describe('统计数据测试', () => {
    test('渲染企业总人数', () => {
      render(<EmployeesPage />);
      expect(screen.getByText('124')).toBeInTheDocument();
      expect(screen.getByText('企业总人数')).toBeInTheDocument();
    });

    test('渲染管理员数量', () => {
      render(<EmployeesPage />);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('管理员数量')).toBeInTheDocument();
    });

    test('渲染 HR 数量', () => {
      render(<EmployeesPage />);
      expect(screen.getByText('118')).toBeInTheDocument();
      expect(screen.getByText('普通 HR (招聘专员)')).toBeInTheDocument();
    });

    test('渲染本月新增标识', () => {
      render(<EmployeesPage />);
      expect(screen.getByText('+3')).toBeInTheDocument();
      expect(screen.getByText('本月新增')).toBeInTheDocument();
    });
  });

  describe('员工列表测试', () => {
    test('渲染人员列表标题', () => {
      render(<EmployeesPage />);
      const title = screen.getByText('人员列表');
      expect(title).toBeInTheDocument();
    });

    test('渲染员工姓名', () => {
      render(<EmployeesPage />);
      expect(screen.getByText('张伟')).toBeInTheDocument();
      expect(screen.getByText('李娜')).toBeInTheDocument();
      expect(screen.getByText('王强')).toBeInTheDocument();
      expect(screen.getByText('赵敏')).toBeInTheDocument();
    });

    test('渲染部门/职位信息', () => {
      render(<EmployeesPage />);
      expect(screen.getByText('管理层')).toBeInTheDocument();
      expect(screen.getByText('CEO')).toBeInTheDocument();
      expect(screen.getByText('人力资源部')).toBeInTheDocument();
      expect(screen.getByText('HR 总监')).toBeInTheDocument();
      expect(screen.getAllByText('招聘组').length).toBeGreaterThan(0);
      expect(screen.getByText('资深招聘专员')).toBeInTheDocument();
    });

    test('渲染角色权限标签', () => {
      render(<EmployeesPage />);
      expect(screen.getAllByText('企业主').length).toBeGreaterThan(0);
      expect(screen.getAllByText('管理员').length).toBeGreaterThan(0);
      expect(screen.getAllByText('招聘专员').length).toBeGreaterThan(0);
    });

    test('渲染状态信息', () => {
      render(<EmployeesPage />);
      const activeStatus = screen.getAllByText('活跃');
      expect(activeStatus.length).toBeGreaterThan(0);
      expect(screen.getByText('已禁用')).toBeInTheDocument();
    });

    test('渲染最近登录时间', () => {
      render(<EmployeesPage />);
      expect(screen.getByText('今天 09:41')).toBeInTheDocument();
      expect(screen.getByText('昨天 14:20')).toBeInTheDocument();
      expect(screen.getByText('今天 10:05')).toBeInTheDocument();
    });
  });

  describe('搜索筛选测试', () => {
    test('渲染筛选按钮', () => {
      render(<EmployeesPage />);
      const filterButton = screen.getByText('筛选');
      expect(filterButton).toBeInTheDocument();
    });

    test('渲染添加员工按钮', () => {
      render(<EmployeesPage />);
      const addButton = screen.getByText('添加员工');
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('分页测试', () => {
    test('渲染分页信息', () => {
      render(<EmployeesPage />);
      expect(screen.getByText('共 124 条记录')).toBeInTheDocument();
    });

    test('渲染分页导航按钮', () => {
      render(<EmployeesPage />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('角色权限说明测试', () => {
    test('渲染角色权限说明标题', () => {
      render(<EmployeesPage />);
      const title = screen.getByText('角色权限说明');
      expect(title).toBeInTheDocument();
    });

    test('渲染企业主权限描述', () => {
      render(<EmployeesPage />);
      expect(screen.getByText(/拥有系统最高权限/)).toBeInTheDocument();
    });

    test('渲染管理员权限描述', () => {
      render(<EmployeesPage />);
      expect(screen.getByText(/可添加\/编辑普通员工/)).toBeInTheDocument();
    });

    test('渲染招聘专员权限描述', () => {
      render(<EmployeesPage />);
      expect(screen.getByText(/执行日常招聘任务/)).toBeInTheDocument();
    });

    test('渲染 AI 提示', () => {
      render(<EmployeesPage />);
      expect(screen.getByText('AI 提示：')).toBeInTheDocument();
    });
  });

  describe('操作按钮测试', () => {
    test('渲染编辑按钮', () => {
      render(<EmployeesPage />);
      const editButtons = screen.getAllByTitle('编辑');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    test('渲染重置密码按钮', () => {
      render(<EmployeesPage />);
      const resetButtons = screen.getAllByTitle('重置密码');
      expect(resetButtons.length).toBeGreaterThan(0);
    });

    test('渲染禁用按钮', () => {
      render(<EmployeesPage />);
      const disableButton = screen.getByTitle('禁用');
      expect(disableButton).toBeInTheDocument();
    });
  });
});
