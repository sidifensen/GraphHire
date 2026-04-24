import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AdminDataTable from '@/components/admin/AdminDataTable';

interface Row {
  id: number;
  name: string;
}

describe('AdminDataTable pagination', () => {
  it('renders correct range text and triggers page change', () => {
    const onPageChange = vi.fn();
    const data: Row[] = [
      { id: 11, name: 'A' },
      { id: 12, name: 'B' },
    ];

    render(
      <AdminDataTable<Row>
        columns={[
          { header: 'ID', accessor: 'id' },
          { header: 'Name', accessor: 'name' },
        ]}
        data={data}
        pagination={{
          currentPage: 2,
          totalPages: 5,
          totalItems: 12,
          pageSize: 10,
          onPageChange,
        }}
      />
    );

    expect(screen.getByText('显示 11 到 12 条，共 12 条记录')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '第 3 页' }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByRole('button', { name: '下一页' }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByRole('button', { name: '上一页' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
