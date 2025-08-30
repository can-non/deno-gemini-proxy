# 1. Deno 공식 이미지를 기반으로 시작합니다.
FROM denoland/deno:1.44.4

# 2. 컨테이너 내부의 작업 디렉토리를 /app으로 설정합니다.
WORKDIR /app

# 3. 외부에서 접속할 포트(8000번)를 열어줍니다.
EXPOSE 8000

# 4. 로컬의 main.ts 파일을 컨테이너의 /app 디렉토리로 복사합니다.
COPY main.ts .

# 5. Deno가 필요한 모듈을 미리 다운로드하여 설치합니다. (배포 속도 향상)
RUN deno cache main.ts

# 6. 컨테이너가 시작될 때 실행할 명령어를 지정합니다.
CMD ["run", "--allow-net", "main.ts"]