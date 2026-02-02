# 👨‍🍳 Mise (미장플라스)
**유튜브와 LLM을 활용한 똑똑한 요리 레시피 추출 서비스**

`Mise`는 요리 유튜브 영상의 방대한 데이터에서 핵심적인 레시피(재료, 조리 순서, 팁)를 AI를 통해 자동으로 추출해주는 프로젝트입니다.

## ✨ 주요 기능
* **유튜브 데이터 분석**: `yfinance`가 금융 데이터를 다루듯, 유튜브 영상에서 요리 정보를 체계적으로 수집하고 분석합니다.
* **고성능 음성 인식 (STT)**: `Faster Whisper`를 사용하여 기존 Whisper 모델보다 최대 4배 빠른 속도로 음성을 텍스트로 변환합니다.
    * `large-v3` 모델 활용으로 높은 정확도 구현.
    * `VAD(Voice Activity Detection)` 필터를 적용해 배경 소음을 제거하고 목소리만 정확하게 추출합니다.
* **AI 레시피 정제**: 추출된 텍스트를 LLM(거대언어모델)을 활용해 재료 리스트와 단계별 조리법으로 구조화합니다.

## 🛠 기술 스택
* **Backend**: Python, Django
* **Frontend**: TypeScript, HTML, CSS
* **AI Engine**: Faster Whisper (STT), Qwen-Thinking (LLM)
* **Environment**: `venv` 및 `requirements.txt` 기반 의존성 관리

## ⚙️ 설치 및 실행 방법

### 1. 요구 사항
* **Python 3.8 이상**
* **GPU 환경 권장**: `Faster Whisper`의 원활한 구동을 위해 NVIDIA CUDA 환경을 권장합니다.
* **VRAM**: `FP8` 양자화 모델 등을 사용할 경우 모델 크기에 따라 최적화된 메모리 사양이 필요합니다.

### 2. 설치 단계
```bash
# 레포지토리 클론
git clone [https://github.com/jinoo98/Mise.git](https://github.com/jinoo98/Mise.git)
cd Mise

# 가상환경 생성 및 활성화
python -m venv venv
# Windows:
call venv/Scripts/activate
# Mac/Linux:
source venv/bin/activate

# 필수 패키지 설치
pip install -r requirements.txt

3. 서버 실행
Bash
python manage.py runserver