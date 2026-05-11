'use client';

import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type InterviewInvitePayload = {
  interviewTime: string;
  location: string;
  remark: string;
};

type InterviewInviteDialogProps = {
  sending: boolean;
  onSubmit: (payload: InterviewInvitePayload) => Promise<void>;
  onError: (message: string) => void;
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDateValue(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function formatDateTimeValue(date: Date, timeText: string): string {
  const [hourText = '00', minuteText = '00'] = timeText.split(':');
  return `${formatDateValue(date)}T${hourText}:${minuteText}:00`;
}

export function InterviewInviteDialog({ sending, onSubmit, onError }: InterviewInviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [dateValue, setDateValue] = useState<Date | undefined>(undefined);
  const [timeValue, setTimeValue] = useState('');
  const [location, setLocation] = useState('');
  const [remark, setRemark] = useState('');

  const previewText = useMemo(() => {
    if (!dateValue || !timeValue) return '';
    return formatDateTimeValue(dateValue, timeValue);
  }, [dateValue, timeValue]);

  const clearForm = () => {
    setDateValue(undefined);
    setTimeValue('');
    setLocation('');
    setRemark('');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && !sending) {
      clearForm();
    }
  };

  const handleSubmit = async () => {
    if (!dateValue || !timeValue || !location.trim()) {
      onError('请填写面试时间和面试地点');
      return;
    }
    await onSubmit({
      interviewTime: formatDateTimeValue(dateValue, timeValue),
      location: location.trim(),
      remark: remark.trim(),
    });
    clearForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-9 px-3 border-primary text-primary">
          {sending ? '发送中...' : '面试通知'}
        </Button>
      </DialogTrigger>
      {/* 企业端主题未定义 surface-lowest/surface-highest，使用 container token 保证弹窗实底且跨主题一致。 */}
      <DialogContent
        aria-label="发送面试通知"
        aria-describedby="interview-dialog-desc"
        className="bg-surface-container-lowest dark:bg-surface-container-highest"
      >
        <DialogHeader>
          <DialogTitle>发送面试通知</DialogTitle>
          <DialogDescription id="interview-dialog-desc">请填写候选人面试信息，发送后会在会话中生成通知消息。</DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interview-date">面试时间（必填）</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="interview-date"
                  type="button"
                  variant="outline"
                  className="w-full justify-start border-outline/30 bg-surface-container-lowest text-left font-medium text-on-surface hover:bg-surface-container-low dark:bg-surface-container-high dark:hover:bg-surface-container-highest"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {previewText || '请选择面试日期与时间'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto bg-surface-container-lowest p-3 dark:bg-surface-container-highest" align="start">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="interview-date-native">日期</Label>
                    <Input
                      id="interview-date-native"
                      type="date"
                      className="bg-surface-container-lowest dark:bg-surface-container-high"
                      value={dateValue ? formatDateValue(dateValue) : ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (!value) {
                          setDateValue(undefined);
                          return;
                        }
                        const [year, month, day] = value.split('-').map((item) => Number(item));
                        if (!year || !month || !day) return;
                        setDateValue(new Date(year, month - 1, day));
                      }}
                    />
                  </div>
                  <Calendar selected={dateValue} onSelect={setDateValue} />
                  <div className="space-y-1">
                    <Label htmlFor="interview-time-native">时间</Label>
                    <Input
                      id="interview-time-native"
                      type="time"
                      className="bg-surface-container-lowest dark:bg-surface-container-high"
                      value={timeValue}
                      onChange={(event) => setTimeValue(event.target.value)}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview-location">面试地点（必填）</Label>
            <Input
              id="interview-location"
              placeholder="面试地点"
              className="bg-surface-container-lowest dark:bg-surface-container-high"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview-remark">面试备注</Label>
            <Input
              id="interview-remark"
              placeholder="面试备注"
              className="bg-surface-container-lowest dark:bg-surface-container-high"
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={sending}>
            取消
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={sending}>
            {sending ? '发送中...' : '确认发送面试通知'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
