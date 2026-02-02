# main/markdown_extras.py
from django import template
from django.utils.safestring import mark_safe
import markdown

register = template.Library()

@register.filter(name='markdown')
def markdown_format(text):
    if not text:
        return ""
    # 아까 말씀하신 끝부분 \n 제거(strip)를 여기서 미리 처리하면 편해요!
    clean_text = text.strip()
    # 마크다운을 HTML로 변환 (extra 확장 기능 포함)
    return mark_safe(markdown.markdown(clean_text, extensions=['extra']))