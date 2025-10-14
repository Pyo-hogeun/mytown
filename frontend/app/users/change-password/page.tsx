'use client';

import { useState } from 'react';
import styled from 'styled-components';
import axios from '@/utils/axiosInstance';
import Container from '@/app/component/Container';
import { Card } from '@/app/component/Card';
import Button from '@/app/component/Button';
import Input from '@/app/component/Input';

const Title = styled.h2`
  margin-bottom: 1.5em;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1em;
`;

const Label = styled.label`
  font-weight: 600;
`;

const StyledButton = styled(Button)`
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  font-weight: bold;
  background-color: #1e90ff;
  color: white;
  border: none;
  border-radius: 8px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9em;
  margin-top: -0.5em;
`;

const SuccessMessage = styled.p`
  color: green;
  font-size: 0.9em;
  margin-top: -0.5em;
`;

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ 비밀번호 정규식 (대문자 + 소문자 + 숫자 + 특수문자 포함, 최소 8자)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=])[A-Za-z\d!@#$%^&*()_\-+=]{8,}$/;

  // ✅ 실시간 유효성 검사 함수
  const validate = (field: string, value: string) => {
    let message = '';

    switch (field) {
      case 'currentPassword':
        if (!value) message = '현재 비밀번호를 입력해주세요.';
        break;
      case 'newPassword':
        if (!value) message = '새 비밀번호를 입력해주세요.';
        else if (!passwordRegex.test(value))
          message = '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.';
        else if (value === currentPassword)
          message = '새 비밀번호는 기존 비밀번호와 달라야 합니다.';
        break;
      case 'confirmPassword':
        if (!value) message = '비밀번호 확인을 입력해주세요.';
        else if (value !== newPassword) message = '새 비밀번호와 일치하지 않습니다.';
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    // 모든 필드에 대한 유효성 검사 실행
    validate('currentPassword', currentPassword);
    validate('newPassword', newPassword);
    validate('confirmPassword', confirmPassword);

    // 에러가 있으면 전송 중단
    const hasError = Object.values(errors).some((msg) => msg);
    if (hasError) return;

    try {
      setLoading(true);
      const res = await axios.patch('/auth/password', {
        currentPassword,
        newPassword,
      });

      if (res.status === 200) {
        setSuccess('비밀번호가 성공적으로 변경되었습니다.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
      }
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.message || '비밀번호 변경에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>비밀번호 변경</Title>
        <Form onSubmit={handleSubmit}>
          <Label>현재 비밀번호</Label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              validate('currentPassword', e.target.value);
            }}
          />
          {errors.currentPassword && <ErrorMessage>{errors.currentPassword}</ErrorMessage>}

          <Label>새 비밀번호</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              validate('newPassword', e.target.value);
            }}
          />
          {errors.newPassword && <ErrorMessage>{errors.newPassword}</ErrorMessage>}

          <Label>새 비밀번호 확인</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              validate('confirmPassword', e.target.value);
            }}
          />
          {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}

          {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <StyledButton type="submit" disabled={loading}>
            {loading ? '변경 중...' : '비밀번호 변경'}
          </StyledButton>
        </Form>
      </Card>
    </Container>
  );
};

export default ChangePasswordPage;
