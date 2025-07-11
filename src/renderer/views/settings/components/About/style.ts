import styled from 'styled-components';

export const AboutContainer = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Segoe UI', sans-serif;
  color: #1a1a1a;
  background: #f4f4f4;

  @media (prefers-color-scheme: dark) {
    color: #e0e0e0;
    background: #1e1e1e;
  }
`;

export const AppHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const AppName = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: inherit;
`;

export const AppInfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const InfoText = styled.div`
  font-size: 16px;
  color: inherit;
`;

export const Contributors = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: inherit;
  max-width: 600px;

  strong {
    color: inherit;
    font-weight: 600;
  }
`;

export const LegalNoticeBox = styled.div`
  font-size: 13px;
  background: rgba(100, 100, 100, 0.1);
  border-left: 4px solid #4caf50;
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.5;
  max-width: 640px;

  @media (prefers-color-scheme: dark) {
    background: rgba(255, 255, 255, 0.05);
    border-left-color: #81c784;
  }
`;
