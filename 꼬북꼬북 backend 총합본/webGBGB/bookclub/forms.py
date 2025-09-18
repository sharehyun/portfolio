from django import forms
from .models import ReadingGroup

class ReadingGroupForm(forms.ModelForm):
    password = forms.CharField(required=False, widget=forms.PasswordInput())

    book_title = forms.CharField(widget=forms.HiddenInput())
    book_author = forms.CharField(widget=forms.HiddenInput())
    book_cover = forms.CharField(widget=forms.HiddenInput())
    book_isbn = forms.CharField(widget=forms.HiddenInput())
    tag = forms.CharField(required=False, widget=forms.HiddenInput())
    book_publisher = forms.CharField(required=False)

    class Meta:
        model = ReadingGroup
        fields = ['group_name', 'description', 'is_public', 'password',
                  'book_title', 'book_author', 'book_cover', 'book_isbn', 'tag']

    def clean(self):
        cleaned_data = super().clean()
        is_public = cleaned_data.get('is_public')
        password = cleaned_data.get('password') # forms.CharField에서 오는 값은 문자열

        # 비공개 그룹인 경우 (is_public이 '1')
        if str(is_public) == "1":
            if not password: # 비밀번호가 비어있으면 에러 발생
                self.add_error('password', '비밀번호를 입력해주세요.')
            else: # 비밀번호가 있으면 정수로 변환 시도
                try:
                    cleaned_data['password'] = int(password) # 모델의 IntegerField에 맞게 정수로 변환
                except ValueError:
                    self.add_error('password', '비밀번호는 숫자여야 합니다.')
        # 공개 그룹인 경우 (is_public이 '0')
        else:
            # 공개 그룹은 비밀번호를 None으로 설정하여 모델의 IntegerField에 올바르게 저장되도록 함
            cleaned_data['password'] = None

        if not cleaned_data.get('book_title') or not cleaned_data.get('book_isbn'):
            raise forms.ValidationError("책을 선택해주세요.")

        return cleaned_data # 클린된 데이터를 반드시 반환해야 합니다.