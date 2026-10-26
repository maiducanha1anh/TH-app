THỰC HÀNH 4 – ỨNG DỤNG QUẢN LÝ HỌC TẬP: API & OFFLINE MODE
1. Mục tiêu
Nâng cấp ứng dụng Quản lý học tập đã làm ở Thực hành 3: thay dữ liệu mẫu viết cứng trong mã nguồn bằng dữ liệu lấy từ REST API. Ứng dụng vẫn phải dùng được khi không có mạng và tự đồng bộ khi có mạng trở lại.
Sau buổi thực hành, sinh viên biết cách:
•	Gọi API (GET, POST, PATCH) và xử lý các trạng thái đang tải, thành công, lỗi.
•	Tách tầng gọi API ra khỏi phần giao diện.
•	Phát hiện trạng thái mạng và lưu bộ nhớ đệm (cache) bằng AsyncStorage.
•	Ghi lại thao tác khi offline và đồng bộ lên server khi có mạng.
Thông tin chung
Mục	Nội dung
Hình thức	Cá nhân
Đầu vào	Mã nguồn ứng dụng Quản lý học tập đã hoàn thành ở Thực hành 3
Công nghệ bắt buộc	React Native (Expo), React Navigation (Bottom Tab + Native Stack), @react-native-async-storage/async-storage, @react-native-community/netinfo, json-server
Thang điểm	10 điểm, cộng tối đa 1 điểm thưởng (tổng không vượt 10)
2. Chuẩn bị server giả lập (Mock API)
Sinh viên dựng server bằng json-server. Cài đặt:
npm install -g json-server@0.17.4
Tạo file db.json gồm các tập dữ liệu dưới đây. Dữ liệu phải nhất quán với bài Thực hành 3, mỗi tập có ít nhất 5 bản ghi.
Tập dữ liệu	Các trường bắt buộc
students	id, studentCode, fullName, className, major, email, phone, updatedAt
courses	id, code, name, credits, lecturer, description, semester
sessions	id, courseId, dayOfWeek, startTime, endTime, room, note
assignments	id, courseId, title, description, dueDate, status (todo hoặc done), updatedAt
grades	id, courseId, semester, attendance, midterm, final, total, letter
Chạy server với độ trễ giả lập 800 ms:
json-server --watch db.json --host 0.0.0.0 --port 3000 --delay 800
Lưu ý về địa chỉ server:
•	Máy ảo Android gọi tới http://10.0.2.2:3000.
•	Điện thoại thật dùng Expo Go gọi tới http://<IP-LAN-của-máy-tính>:3000. Điện thoại và máy tính phải cùng mạng Wi-Fi.
•	BASE_URL phải đặt trong một file cấu hình riêng (src/config.js), không viết trực tiếp vào từng màn hình.
Các endpoint ứng dụng cần dùng:
Phương thức	Endpoint	Dùng ở màn hình
GET	/students/1	Trang chủ, Cá nhân
PATCH	/students/1	Chỉnh sửa thông tin cá nhân
GET	/courses, /courses/:id	Môn học, Chi tiết môn học
GET	/sessions?_expand=course	Thời khóa biểu, Chi tiết buổi học
GET	/assignments?_expand=course&_sort=dueDate	Bài tập, Trang chủ
PATCH	/assignments/:id	Cập nhật trạng thái bài tập
POST	/assignments	Thêm bài tập mới (chức năng mới)
GET	/grades?_expand=course	Kết quả học tập
Dữ liệu mẫu (mỗi tập một bản ghi; sinh viên bổ sung đủ tối thiểu 5 bản ghi, giữ đúng định dạng):
{
  "students": [
    { "id": 1, "studentCode": "SV2021001", "fullName": "Nguyễn Văn An",
      "className": "CNTT-K21A", "major": "Công nghệ thông tin",
      "email": "an.nv@student.edu.vn", "phone": "0912345678",
      "updatedAt": "2026-10-20T08:00:00Z" }
  ],
  "courses": [
    { "id": 1, "code": "INT3120", "name": "Phát triển ứng dụng di động",
      "credits": 3, "lecturer": "TS. Trần Minh",
      "description": "Lập trình ứng dụng di động đa nền tảng với React Native.",
      "semester": "HK1 2026-2027" }
  ],
  "sessions": [
    { "id": 1, "courseId": 1, "dayOfWeek": 2, "startTime": "07:00",
      "endTime": "09:30", "room": "P.301-A2", "note": "Mang laptop" }
  ],
  "assignments": [
    { "id": 1, "courseId": 1, "title": "Thực hành 4: API & Offline",
      "description": "Kết nối API và hỗ trợ chế độ offline.",
      "dueDate": "2026-11-09T23:59:00Z", "status": "todo",
      "updatedAt": "2026-10-26T08:00:00Z" }
  ],
  "grades": [
    { "id": 1, "courseId": 1, "semester": "HK1 2026-2027",
      "attendance": 9, "midterm": 7.5, "final": 8.5,
      "total": 8.25, "letter": "B+" }
  ]
}
Quy ước: dayOfWeek từ 2 (Thứ 2) đến 8 (Chủ nhật); thời gian lưu theo chuẩn ISO 8601; total = 10% chuyên cần + 30% giữa kỳ + 60% cuối kỳ.
3. Màn hình và điều hướng
Ứng dụng giữ 5 tab của Thực hành 3. Mỗi tab là một Native Stack riêng, chứa màn hình chính và các màn hình chi tiết.
Tab	Màn hình chính	Màn hình trong Stack	Dữ liệu từ API	Khi offline
Tổng quan	HomeScreen: họ tên, mã sinh viên; môn đang học; bài tập đến hạn trong 7 ngày tới; số thay đổi chưa đồng bộ	CourseDetail, AssignmentDetail	/students/1, /courses, /assignments	Hiển thị từ cache
Môn học	CourseListScreen: FlatList mã môn, tên môn, số tín chỉ; tìm theo tên; lọc theo học kỳ	CourseDetail: thông tin môn, lịch học và bài tập của môn	/courses, /courses/:id	Hiển thị từ cache; tìm kiếm và lọc vẫn hoạt động
Thời khóa biểu	ScheduleScreen: chọn ngày bằng DaySelector; danh sách buổi học gồm tên môn, thời gian, phòng	SessionDetail	/sessions?_expand=course	Hiển thị từ cache
Bài tập	AssignmentListScreen: tên bài, môn, hạn nộp, trạng thái; lọc Tất cả / Chưa xong / Đã xong / Quá hạn; nút Thêm	AssignmentDetail, AssignmentForm	/assignments	Đổi trạng thái và thêm mới đưa vào hàng đợi
Cá nhân	ProfileScreen: mã sinh viên, họ tên, lớp, ngành, email, số điện thoại; GPA tóm tắt	EditProfile, GradeList, GradeDetail	/students/1, /grades	Sửa thông tin đưa vào hàng đợi; điểm hiển thị từ cache
Quy tắc điều hướng:
1.	Tên màn hình khai báo một lần trong navigation/routes.js, không viết chuỗi trực tiếp khi gọi navigate.
2.	Màn hình chi tiết chỉ nhận { id } qua route.params; tiêu đề header là tên mục được chọn (đặt bằng navigation.setOptions).
3.	Mọi màn hình chi tiết có nút quay lại; sau khi lưu form thành công thì tự quay về màn hình trước.
4.	Tab Bài tập hiển thị tabBarBadge bằng số bài chưa hoàn thành; tab nào cũng có biểu tượng.
4. Yêu cầu chức năng (10 điểm)
Phần	Nội dung	Điểm
A	Gọi API	4
B	Chế độ offline	4
C	Kết quả học tập	1
D	Chất lượng mã nguồn và cấu trúc	1
Điểm cộng	Xem mục 8	tối đa +1
Điểm từng yêu cầu chỉ được tính khi chức năng chạy đúng trong video demo và các kịch bản kiểm thử ở mục 6.
Phần A. Gọi API (4 điểm)
A1. Tầng gọi API. Tạo thư mục src/api/ gồm:
•	client.js: hàm chung để gọi API bằng fetch hoặc axios. Hàm này có timeout 10 giây, kiểm tra mã HTTP và trả về lỗi đã chuẩn hóa.
•	Mỗi tài nguyên có một file service riêng: courseService.js, assignmentService.js, …
•	Màn hình không được gọi fetch trực tiếp.
A2. Thay dữ liệu mẫu bằng dữ liệu từ API cho cả 5 màn hình chính và 4 màn hình chi tiết. Màn hình chi tiết chỉ nhận id qua route.params rồi tự gọi API lấy chi tiết, không truyền cả object qua params.
A3. Xử lý đủ 4 trạng thái trên mọi màn hình danh sách:
•	Đang tải: ActivityIndicator hoặc khung chờ (skeleton).
•	Có dữ liệu.
•	Danh sách rỗng: dùng ListEmptyComponent.
•	Lỗi: thông báo dễ hiểu kèm nút “Thử lại”.
A4. Kéo để làm mới bằng refreshing và onRefresh của FlatList.
A5. Thêm bài tập mới. Tạo màn hình form trong Stack, gửi dữ liệu bằng POST. Kiểm tra dữ liệu đầu vào: tiêu đề không rỗng, hạn nộp không ở quá khứ.
A6. Cập nhật lạc quan (optimistic update) khi đổi trạng thái bài tập: giao diện đổi ngay khi bấm; nếu API báo lỗi thì hoàn tác và hiển thị thông báo.
Phần B. Chế độ offline (4 điểm)
B1. Theo dõi trạng thái mạng. Dùng @react-native-community/netinfo, viết custom hook useNetworkStatus(). Khi mất mạng, hiển thị banner “Bạn đang offline” ở mọi màn hình.
B2. Bộ nhớ đệm theo chiến lược “cache trước, mạng sau”.
•	Mỗi lần gọi GET thành công, lưu kết quả vào AsyncStorage kèm thời điểm lưu. Ví dụ khóa cache:courses lưu { data, savedAt }.
•	Khi mở màn hình, hiển thị ngay dữ liệu trong cache, sau đó gọi API để cập nhật nếu có mạng.
•	Khi offline, hiển thị dòng “Cập nhật lần cuối: 14:32, 26/10/2026”.
B3. Hàng đợi thao tác (outbox).
•	Khi offline, các thao tác cập nhật trạng thái bài tập, thêm bài tập và sửa thông tin cá nhân không bị chặn. Chúng được lưu vào hàng đợi trong AsyncStorage, dạng { id, method, url, body, createdAt }.
•	Mục chưa đồng bộ hiển thị nhãn “Chưa đồng bộ”.
B4. Tự đồng bộ.
•	Khi có mạng trở lại, ứng dụng gửi lần lượt các thao tác trong hàng đợi theo đúng thứ tự.
•	Thao tác thành công thì xóa khỏi hàng đợi; thao tác lỗi thì giữ lại để thử lại sau.
•	Sau khi đồng bộ, hiển thị thông báo “Đã đồng bộ 3 thay đổi”.
B5. Xử lý xung đột. So sánh trường updatedAt. Nếu dữ liệu trên server mới hơn thao tác offline thì ưu tiên dữ liệu server và báo cho người dùng. Giải thích cách xử lý này trong README.
Phần C. Kết quả học tập (1 điểm)
•	Trong tab Cá nhân, thêm danh sách điểm theo học kỳ, lấy từ /grades.
•	Tính GPA hệ 4 (có trọng số theo số tín chỉ) và tổng số tín chỉ tích lũy.
•	Có bộ lọc theo học kỳ.
•	Bấm vào một môn để mở Chi tiết kết quả học tập: điểm chuyên cần, giữa kỳ, cuối kỳ, tổng kết, điểm chữ.
Bảng quy đổi điểm dùng trong utils/gpa.js:
Điểm hệ 10	Điểm chữ	Điểm hệ 4
8,5 – 10	A	4,0
8,0 – 8,4	B+	3,5
7,0 – 7,9	B	3,0
6,5 – 6,9	C+	2,5
5,5 – 6,4	C	2,0
5,0 – 5,4	D+	1,5
4,0 – 4,9	D	1,0
Dưới 4,0	F	0
GPA = tổng (điểm hệ 4 × số tín chỉ) / tổng số tín chỉ. Môn điểm F không tính vào số tín chỉ tích lũy.
Phần D. Chất lượng mã nguồn (1 điểm)
•	Dùng Context API (ví dụ AppDataContext, SyncContext) để chia sẻ dữ liệu giữa các tab. Đổi trạng thái bài tập ở tab Bài tập thì Trang chủ phải cập nhật theo.
•	Có ít nhất 2 custom hook, ví dụ useCachedQuery và useNetworkStatus.
•	Tuân thủ đúng cây thư mục và chuẩn component ở mục 5. Mỗi file sai vị trí hoặc component vi phạm quy tắc chung bị trừ 0,25 điểm.
5. Cấu trúc thư mục và component chuẩn
Dự án bắt buộc theo đúng cây thư mục dưới đây: đúng tên file, đúng vị trí. Có thể thêm file, nhưng không được bỏ hoặc đổi tên các file đã liệt kê.
5.1. Cây thư mục
StudyManager/
├── App.js                        # Chỉ bọc Provider + AppNavigator
├── db.json                       # Dữ liệu json-server
├── README.md
└── src/
    ├── config.js                 # BASE_URL, TIMEOUT, CACHE_TTL
    ├── api/
    │   ├── client.js             # request(method, url, body)
    │   ├── studentService.js
    │   ├── courseService.js
    │   ├── sessionService.js
    │   ├── assignmentService.js
    │   └── gradeService.js
    ├── storage/
    │   ├── keys.js               # Tên khóa AsyncStorage
    │   ├── cache.js              # getCache, setCache
    │   └── outbox.js             # enqueue, getAll, remove
    ├── context/
    │   ├── AppDataContext.js     # student, courses, assignments, grades
    │   └── SyncContext.js        # isOnline, pendingCount, syncNow
    ├── hooks/
    │   ├── useNetworkStatus.js
    │   ├── useCachedQuery.js
    │   └── useOutboxSync.js
    ├── navigation/
    │   ├── routes.js             # Hằng số tên màn hình
    │   ├── AppNavigator.js       # Bottom Tab 5 tab
    │   ├── HomeStack.js
    │   ├── CourseStack.js
    │   ├── ScheduleStack.js
    │   ├── AssignmentStack.js
    │   └── ProfileStack.js
    ├── screens/
    │   ├── home/
    │   │   └── HomeScreen.js
    │   ├── courses/
    │   │   ├── CourseListScreen.js
    │   │   └── CourseDetailScreen.js
    │   ├── schedule/
    │   │   ├── ScheduleScreen.js
    │   │   └── SessionDetailScreen.js
    │   ├── assignments/
    │   │   ├── AssignmentListScreen.js
    │   │   ├── AssignmentDetailScreen.js
    │   │   └── AssignmentFormScreen.js
    │   └── profile/
    │       ├── ProfileScreen.js
    │       ├── EditProfileScreen.js
    │       ├── GradeListScreen.js
    │       └── GradeDetailScreen.js
    ├── components/
    │   ├── common/
    │   │   ├── ScreenContainer.js
    │   │   ├── OfflineBanner.js
    │   │   ├── LoadingView.js
    │   │   ├── ErrorView.js
    │   │   ├── EmptyState.js
    │   │   ├── SearchBar.js
    │   │   ├── FilterChips.js
    │   │   ├── SyncBadge.js
    │   │   ├── LastUpdatedText.js
    │   │   ├── AppButton.js
    │   │   └── FormInput.js
    │   ├── course/
    │   │   └── CourseCard.js
    │   ├── schedule/
    │   │   ├── DaySelector.js
    │   │   └── SessionCard.js
    │   ├── assignment/
    │   │   ├── AssignmentItem.js
    │   │   └── StatusToggle.js
    │   ├── grade/
    │   │   ├── GpaSummary.js
    │   │   └── GradeRow.js
    │   └── profile/
    │       └── InfoRow.js
    ├── theme/
    │   ├── colors.js
    │   ├── spacing.js
    │   └── typography.js
    └── utils/
        ├── date.js               # formatDate, isOverdue, daysLeft
        ├── gpa.js                # toScale4, calcGpa
        └── validators.js
5.2. Phân tầng và quy tắc phụ thuộc
Mỗi tầng chỉ được gọi tầng ngay bên dưới nó:
Tầng	Được phép dùng	Không được phép
screens/	components/, hooks/, context/, navigation/routes.js	Gọi fetch, axios, AsyncStorage trực tiếp
components/	theme/, utils/, component khác	Gọi API, đọc Context, dùng navigation
hooks/, context/	api/, storage/, utils/	Import component hoặc screen
api/	config.js	Dùng AsyncStorage, Context, React
storage/	storage/keys.js	Gọi API
5.3. Quy tắc chung cho mọi component
1.	Function component, mỗi file một component, export default; tên file trùng tên component, viết PascalCase.
2.	Thứ tự trong file: import → component → StyleSheet.create ở cuối file. Không viết style inline, trừ giá trị động.
3.	Không viết cứng màu, cỡ chữ, khoảng cách: lấy từ theme/.
4.	Component trong components/ là component trình bày: chỉ nhận dữ liệu qua props, báo sự kiện qua callback onXxx. Không gọi API, không đọc Context.
5.	Props tùy chọn phải có giá trị mặc định. Props bắt buộc được ghi chú bằng JSDoc ở đầu file.
6.	Vùng bấm tối thiểu 44×44; mọi nút có accessibilityLabel.
7.	Item trong FlatList bọc React.memo; FlatList luôn có keyExtractor và ListEmptyComponent.
8.	Văn bản hiển thị bằng tiếng Việt, ngày giờ định dạng qua utils/date.js (dd/MM/yyyy, HH:mm).
5.4. Đặc tả component dùng chung
Component	Props	Yêu cầu
ScreenContainer	children, scroll (mặc định false)	Bọc SafeAreaView, nền theo theme, tự hiển thị OfflineBanner ở đầu. Mọi screen phải dùng component này
OfflineBanner	không có (đọc từ useNetworkStatus)	Chỉ hiện khi offline, nội dung “Bạn đang offline”. Đây là ngoại lệ duy nhất được dùng hook trong components/
LoadingView	message (mặc định “Đang tải…”)	ActivityIndicator căn giữa và dòng chữ
ErrorView	message, onRetry	Biểu tượng, thông báo lỗi, nút “Thử lại” gọi onRetry
EmptyState	title, description, actionLabel, onAction	Hiển thị khi danh sách rỗng; nút hành động chỉ hiện khi có onAction
SearchBar	value, onChangeText, placeholder	Có nút xóa nhanh khi có nội dung
FilterChips	options, selected, onSelect	Danh sách chip cuộn ngang, chip đang chọn có màu nhấn
SyncBadge	pending (boolean)	Hiện nhãn “Chưa đồng bộ” khi pending = true, ngược lại không hiện gì
LastUpdatedText	timestamp	Hiển thị “Cập nhật lần cuối: HH:mm, dd/MM/yyyy”; không hiện khi timestamp rỗng
AppButton	title, onPress, variant (primary hoặc outline), loading, disabled	Khi loading thì hiện spinner và không cho bấm
FormInput	label, value, onChangeText, error, keyboardType	Hiện error màu đỏ bên dưới ô nhập
5.5. Đặc tả component theo chức năng
Component	Props	Yêu cầu
CourseCard	course, onPress	Hiển thị mã môn, tên môn, số tín chỉ, giảng viên
DaySelector	selectedDay, onSelectDay	7 nút Thứ 2 → Chủ nhật, mặc định chọn ngày hôm nay
SessionCard	session, onPress	Tên môn, giờ bắt đầu – kết thúc, phòng học
AssignmentItem	assignment, pending, onPress, onToggleStatus	Tiêu đề, tên môn, hạn nộp; tô đỏ khi quá hạn; có StatusToggle và SyncBadge
StatusToggle	status, onToggle	Chuyển todo ↔ done, có biểu tượng khác nhau cho hai trạng thái
GpaSummary	gpa, totalCredits	GPA làm tròn 2 chữ số thập phân và tổng tín chỉ tích lũy
GradeRow	grade, onPress	Tên môn, số tín chỉ, điểm tổng kết, điểm chữ
InfoRow	label, value	Một dòng nhãn – giá trị trong màn hình Cá nhân
5.6. Đặc tả hook, service và storage
File	Hàm xuất ra	Hợp đồng
api/client.js	request(method, url, body)	Trả về dữ liệu JSON; khi lỗi thì throw đối tượng { type, status, message }, trong đó type là 'network', 'timeout' hoặc 'http'
api/*Service.js	getAll(), getById(id), update(id, data), create(data)	Chỉ gọi request, không xử lý cache
storage/cache.js	getCache(key), setCache(key, data)	Lưu { data, savedAt }
storage/outbox.js	enqueue(action), getAll(), remove(id)	Giữ đúng thứ tự thêm vào
hooks/useNetworkStatus.js	useNetworkStatus()	Trả về { isOnline }
hooks/useCachedQuery.js	useCachedQuery(key, fetcher)	Trả về { data, loading, error, refreshing, lastUpdated, refresh }
hooks/useOutboxSync.js	useOutboxSync()	Tự đồng bộ khi isOnline chuyển sang true; trả về { pendingCount, syncing, syncNow }
utils/gpa.js	toScale4(score10), calcGpa(grades, courses)	Có trọng số theo tín chỉ
5.7. Ví dụ component đạt chuẩn
// src/components/common/EmptyState.js
/**
 * @param {string} title - Bắt buộc
 * @param {string} [description]
 * @param {string} [actionLabel]
 * @param {() => void} [onAction]
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from './AppButton';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function EmptyState({ title, description = '', actionLabel = 'Thử lại', onAction }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {onAction ? <AppButton title={actionLabel} variant="outline" onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { ...typography.h3, color: colors.text, textAlign: 'center' },
  description: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginVertical: spacing.sm },
});
6. Kịch bản kiểm thử bắt buộc
Ứng dụng được chấm theo 7 kịch bản dưới đây. Sinh viên tự kiểm tra đủ các kịch bản trước khi nộp.
#	Kịch bản	Kết quả mong đợi
1	Tắt json-server rồi mở ứng dụng lần đầu	Hiển thị màn hình lỗi có nút “Thử lại”, ứng dụng không bị dừng
2	Mở ứng dụng khi có mạng, sau đó bật chế độ máy bay và khởi động lại ứng dụng	Vẫn thấy dữ liệu từ cache, có banner offline và thời điểm cập nhật cuối
3	Khi offline: đánh dấu 2 bài tập đã xong và thêm 1 bài tập mới	Giao diện cập nhật ngay, các mục có nhãn “Chưa đồng bộ”
4	Tắt chế độ máy bay	Tự đồng bộ, nhãn biến mất, db.json thay đổi đúng
5	Khi offline sửa họ tên; đồng thời sửa trực tiếp db.json với updatedAt mới hơn; rồi bật mạng	Áp dụng đúng quy tắc xử lý xung đột và có thông báo
6	Tìm môn học không tồn tại, hoặc lọc học kỳ không có dữ liệu	Hiển thị trạng thái rỗng thân thiện
7	Kéo để làm mới trên các danh sách	Dữ liệu được tải lại
7. Bài nộp
1.	Link GitHub chứa mã nguồn, kèm file db.json và README hướng dẫn chạy.
2.	Video demo 3–5 phút, thực hiện đủ 7 kịch bản ở mục 6.
3.	Trong README, vẽ sơ đồ ngắn về luồng dữ liệu: Màn hình → Hook → Service → Cache / Outbox → API, và giải thích cách xử lý xung đột (B5).
Hạn nộp và nơi nộp: theo thông báo của giảng viên.
8. Điểm cộng (tối đa +1)
•	Dùng SQLite (expo-sqlite) thay cho AsyncStorage để lưu cache và hàng đợi.
•	Đặt thông báo cục bộ (expo-notifications) nhắc bài tập trước hạn 24 giờ.
•	Dùng TanStack Query với persistQueryClient. Phần hàng đợi offline vẫn phải tự viết, không dùng thư viện làm sẵn.
•	Đưa server lên MockAPI.io hoặc Render để demo không cần mạng LAN.
