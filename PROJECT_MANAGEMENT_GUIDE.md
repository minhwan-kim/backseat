# 포트폴리오 프로젝트 관리 가이드

## 🎯 새로운 시스템 개요

각 프로젝트 폴더에 `metadata.json` 파일을 추가하여 프로젝트 정보를 관리합니다.
이미지를 추가/삭제해도 제목, 날짜, 캡션이 초기화되지 않습니다!

## 📁 프로젝트 구조

```
images/
  project_01/
    ├── metadata.json     ← 프로젝트 정보 (제목, 날짜, 캡션)
    ├── thumb.jpg         ← 썸네일 (필수!)
    ├── image1.jpg
    └── image2.jpg
```

## ✨ 새 프로젝트 추가하기

### Step 1: 프로젝트 폴더 생성
```bash
mkdir images/project_17
```

### Step 2: 이미지 파일 추가
- 프로젝트 이미지들을 폴더에 복사
- **필수:** `thumb.jpg` 파일 추가 (썸네일용)

### Step 3: metadata.json 생성
```bash
# 템플릿 복사
cp metadata.template.json images/project_17/metadata.json

# 파일 편집
code images/project_17/metadata.json
```

**metadata.json 예시:**
```json
{
  "title": "My New Project",
  "date": "2025",
  "defaultCaption": "My New Project - Default caption for all images"
}
```

**개별 이미지에 다른 캡션 지정:**
```json
{
  "title": "My New Project",
  "date": "2025",
  "defaultCaption": "My New Project",
  "captions": {
    "image1.jpg": "특별한 캡션 1",
    "image2.jpg": "특별한 캡션 2",
    "image3.jpg": "특별한 캡션 3"
  }
}
```

### Step 4: projects.json 생성
```bash
node generateProjectsJson.js
```

## 🔄 기존 프로젝트 수정하기

### 이미지 추가/삭제
```bash
# 1. 이미지 추가/삭제
cp new_image.jpg images/project_01/
rm images/project_01/old_image.jpg

# 2. JSON 재생성 - metadata.json 덕분에 제목/날짜 유지됨!
node generateProjectsJson.js
```

### 제목/날짜/캡션 수정
```bash
# metadata.json 직접 편집
code images/project_01/metadata.json

# JSON 재생성
node generateProjectsJson.js
```

## 📝 metadata.json 필드 설명

| 필드 | 필수 | 설명 |
|------|------|------|
| `title` | ✓ | 프로젝트 제목 |
| `date` | ✓ | 프로젝트 연도 (예: "2025", "2024–ongoing") |
| `defaultCaption` | | 모든 이미지의 기본 캡션 (지정 안하면 "project_XX - filename.jpg" 형식) |
| `captions` | | 개별 이미지별 캡션 (파일명을 키로 사용) |

## 💡 사용 팁

### 1. 모든 이미지에 같은 캡션 사용
```json
{
  "title": "MoMA Exhibition",
  "date": "2024",
  "defaultCaption": "Exhibition Design for MoMA"
}
```

### 2. 일부 이미지만 다른 캡션 사용
```json
{
  "title": "Nike Campaign",
  "date": "2022",
  "defaultCaption": "Nike Future Movement Campaign",
  "captions": {
    "hero.jpg": "Nike Future Movement - Hero Image",
    "detail.jpg": "Nike Future Movement - Product Detail"
  }
}
```

### 3. captions 생략 시
`defaultCaption`이 없으면 자동으로 "project_XX - filename.jpg" 형식이 사용됩니다.

## 🚨 주의사항

1. **thumb.jpg는 필수입니다!** 각 프로젝트 폴더에 반드시 포함해야 합니다.
2. **metadata.json 파일명은 정확히 지켜야 합니다** (대소문자 구분)
3. **JSON 형식이 올바른지 확인하세요** (쉼표, 따옴표 등)
4. 프로젝트 폴더 이름은 `project_01`, `project_02` 형식으로 번호 순서대로 작성

## 🔧 유용한 명령어

```bash
# 모든 프로젝트의 metadata.json 확인
find images/project_* -name "metadata.json" -exec echo {} \; -exec cat {} \;

# 특정 프로젝트의 metadata.json 편집
code images/project_16/metadata.json

# JSON 재생성
node generateProjectsJson.js
```

## 🆘 문제 해결

### Q: metadata.json을 만들었는데 적용이 안돼요
A: `node generateProjectsJson.js`를 실행했는지 확인하세요.

### Q: JSON 파일이 에러가 나요
A: JSON Validator로 문법 오류를 확인하세요. (쉼표, 따옴표 확인)

### Q: 이미지를 추가했는데 안 보여요
A: `thumb.jpg` 파일이 있는지, `node generateProjectsJson.js`를 실행했는지 확인하세요.

## 📦 파일 설명

- `generateProjectsJson.js` - projects.json 자동 생성 스크립트
- `metadata.template.json` - 새 프로젝트용 템플릿
- `createMetadataFiles.js` - 기존 프로젝트용 metadata.json 생성 (일회성)
- `projects.json` - 웹사이트에서 사용하는 최종 데이터 (직접 수정 X)
