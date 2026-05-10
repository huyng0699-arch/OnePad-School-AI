import type { Assignment, GroupAssignment, Lesson, Mastery, Quiz, Student } from '../types';

export const student: Student = {
  id: 'stu1',
  name: 'Nguyen Van A',
  grade: '8',
  email: 'vana@example.com',
  className: '8A',
  studentCode: 'OPS-8A-001',
  schoolName: 'OnePad Demo School',
  homeroomTeacher: 'Demo Teacher'
};

export const lesson: Lesson = {
  id: 'les-bio8-cell-001',
  title: 'Cau truc te bao',
  subject: 'Sinh hoc 8',
  grade: '8',
  pages: [
    {
      pageNumber: 1,
      title: 'Tong quan te bao',
      blocks: [
        { type: 'heading', text: 'Te bao la don vi co ban cua su song' },
        {
          type: 'paragraph',
          text: 'Moi co the song deu duoc cau tao tu te bao. Te bao tham gia trao doi chat va nang luong.'
        },
        {
          type: 'key_point',
          text: 'Co the da bao gom nhieu te bao chuyen hoa thanh cac mo va co quan.'
        },
        {
          type: 'question',
          question: 'Why is the cell considered the basic structural and functional unit of life?',
          options: [
            'Because every living organism is made of one or more cells',
            'Because cells only store water',
            'Because cells never divide',
            'Because cells exist only in plants'
          ],
          correctAnswer: 'Because every living organism is made of one or more cells',
          explanation:
            'Cells build tissues and perform essential life functions, so they are basic units of structure and function.'
        }
      ],
      aiText:
        'Trang 1 trinh bay tong quan: te bao la don vi co ban cua su song va tham gia moi hoat dong song.'
    },
    {
      pageNumber: 2,
      title: 'Thanh phan chinh cua te bao',
      blocks: [
        { type: 'heading', text: 'Mang sinh chat, te bao chat va nhan' },
        {
          type: 'paragraph',
          text: 'Mang sinh chat bao boc va dieu khien trao doi chat. Te bao chat chua cac bao quan. Nhan chua vat chat di truyen.'
        },
        {
          type: 'example',
          text: 'Vi du: Te bao co co nhieu ti the de cung cap nang luong cho co van dong.'
        },
        {
          type: 'image',
          imageUrl: 'mock://bio8/cell-structure-image',
          caption: 'So do cau truc te bao dong vat (mock)',
          aiDescription:
            'Hinh mo ta vi tri mang sinh chat, te bao chat va nhan trong te bao dong vat.'
        }
      ],
      aiText:
        'Trang 2 mo ta 3 thanh phan chinh cua te bao va vi du ve vai tro cua bao quan trong te bao co.'
    },
    {
      pageNumber: 3,
      title: 'Mo hinh 3D va van dung',
      blocks: [
        { type: 'heading', text: 'Kham pha te bao bang mo hinh AR mock' },
        {
          type: 'paragraph',
          text: 'Hoc sinh co the xoay, phong to va quan sat tuong quan giua cac bo phan trong te bao.'
        },
        {
          type: 'ar_model',
          label: 'Animal Cell 3D (Grade 8)',
          modelUrl: 'local://assets/models/animal-cell-grade8.glb',
          description:
            'Mo hinh AR te bao dong vat cho bai Sinh hoc 8. Ban mock hien ten model va huong dan xoay/phong to.'
        },
        {
          type: 'question',
          question: 'If the nucleus is damaged, which process is most likely affected first?',
          options: [
            'Control of genetic information and cell activities',
            'Simple diffusion of oxygen',
            'Water evaporation from skin',
            'Formation of bone minerals'
          ],
          correctAnswer: 'Control of genetic information and cell activities',
          explanation:
            'The nucleus stores genetic material and regulates key cell functions, so damage affects control processes first.'
        }
      ],
      aiText:
        'Trang 3 huong dan quan sat mo hinh 3D va dat cau hoi van dung de cuong co hieu biet cau truc te bao.'
    }
  ]
};

export const biologyLongLesson: Lesson = {
  id: 'les-bio8-cell-long-002',
  title: 'Te bao va to chuc co the song',
  subject: 'Sinh hoc 8',
  grade: '8',
  pages: [
    {
      pageNumber: 1,
      title: 'Te bao la don vi co ban',
      blocks: [
        { type: 'heading', text: 'Moi co the song bat dau tu te bao' },
        {
          type: 'paragraph',
          text: 'Te bao la don vi cau truc va chuc nang cua co the song. Mot so sinh vat chi co mot te bao, nhung co the nguoi gom hang nghin ti te bao chuyen hoa thanh mo, co quan va he co quan.'
        },
        {
          type: 'key_point',
          text: 'Khi hoc ve te bao, can nhin dong thoi 3 viec: cau truc nao co mat, cau truc do lam gi, va no lien he voi hoat dong song nhu the nao.'
        },
        {
          type: 'question',
          question: 'Vi sao te bao duoc xem la don vi co ban cua co the song?',
          options: [
            'Vi te bao cau tao nen co the va thuc hien cac hoat dong song co ban',
            'Vi te bao chi co trong dong vat',
            'Vi te bao khong can trao doi chat',
            'Vi te bao khong bao gio phan chia'
          ],
          correctAnswer: 'Vi te bao cau tao nen co the va thuc hien cac hoat dong song co ban',
          explanation: 'Te bao vua tao nen cau truc co the, vua thuc hien trao doi chat, sinh truong, cam ung va sinh san.'
        }
      ],
      aiText:
        'Trang 1: Te bao la don vi cau truc va chuc nang cua co the song. Sinh vat don bao co mot te bao van thuc hien du hoat dong song. Sinh vat da bao co nhieu te bao phan hoa thanh mo, co quan va he co quan. Hoc sinh can gan cau truc voi chuc nang: mang sinh chat bao boc va trao doi, te bao chat la noi dien ra nhieu phan ung, nhan dieu khien hoat dong va chua thong tin di truyen. Khi giai thich vi sao te bao la don vi co ban, can neu ca hai y: co the duoc cau tao tu te bao va te bao thuc hien cac chuc nang song.'
    },
    {
      pageNumber: 2,
      title: 'Mang sinh chat',
      blocks: [
        { type: 'heading', text: 'Mang sinh chat la ranh gioi song' },
        {
          type: 'paragraph',
          text: 'Mang sinh chat bao quanh te bao, ngan cach moi truong ben trong voi ben ngoai. Mang co tinh chon loc, cho mot so chat di qua va han che chat khac.'
        },
        {
          type: 'example',
          text: 'O te bao long ruot, mang sinh chat giup hap thu chat dinh duong tu thuc an da duoc tieu hoa.'
        },
        {
          type: 'question',
          question: 'Tinh chon loc cua mang sinh chat co y nghia gi?',
          options: [
            'Giup te bao kiem soat chat nao duoc vao va ra khoi te bao',
            'Lam te bao mat het nuoc',
            'Lam nhan te bao bien mat',
            'Khien te bao khong can nang luong'
          ],
          correctAnswer: 'Giup te bao kiem soat chat nao duoc vao va ra khoi te bao',
          explanation: 'Tinh chon loc giup duy tri moi truong ben trong on dinh va phu hop voi hoat dong song.'
        }
      ],
      aiText:
        'Trang 2: Mang sinh chat la lop bao boc te bao va co tinh tham chon loc. No giup te bao tiep nhan chat can thiet nhu nuoc, oxygen, chat dinh duong, dong thoi thai bo chat can loai ra. Neu mang mat kha nang chon loc, te bao kho duy tri can bang noi moi. Vi du te bao long ruot can mang de hap thu duong don, amino acid va khoang chat; te bao co can mang de tiep nhan tin hieu va trao doi ion khi co co.'
    },
    {
      pageNumber: 3,
      title: 'Te bao chat va bao quan',
      blocks: [
        { type: 'heading', text: 'Te bao chat la noi nhieu hoat dong dien ra' },
        {
          type: 'paragraph',
          text: 'Te bao chat gom chat nen va cac bao quan. Moi bao quan co vai tro rieng, phoi hop de te bao hoat dong binh thuong.'
        },
        {
          type: 'key_point',
          text: 'Ti the thuong duoc goi la noi tao nang luong vi tham gia ho hap te bao.'
        },
        {
          type: 'question',
          question: 'Te bao co vi sao thuong co nhieu ti the?',
          options: [
            'Vi te bao co can nhieu nang luong de co rut',
            'Vi te bao co khong can oxygen',
            'Vi ti the chi de tao mau sac',
            'Vi ti the la noi chua thong tin di truyen chinh'
          ],
          correctAnswer: 'Vi te bao co can nhieu nang luong de co rut',
          explanation: 'Co rut can ATP, ma ti the tham gia tao ATP thong qua ho hap te bao.'
        }
      ],
      aiText:
        'Trang 3: Te bao chat khong phai khoang trong rong, ma la moi truong chua nhieu bao quan. Ti the tham gia tao ATP cho hoat dong cua te bao. Ribosome tong hop protein. Luoi noi chat va bo may Golgi tham gia van chuyen, bien doi va dong goi chat. Lizosome giup phan giai mot so chat. Trong bai hoc cap THCS, can tap trung vao y tuong moi bao quan co nhiem vu rieng va tat ca phoi hop nhu mot he thong. Te bao co co nhieu ti the vi nhu cau nang luong cao.'
    },
    {
      pageNumber: 4,
      title: 'Nhan te bao',
      blocks: [
        { type: 'heading', text: 'Nhan dieu khien hoat dong cua te bao' },
        {
          type: 'paragraph',
          text: 'Nhan thuong chua vat chat di truyen va dieu khien nhieu hoat dong cua te bao. Khong phai moi te bao deu co nhan hoan chinh, nhung voi te bao nhan thuc, nhan rat quan trong.'
        },
        {
          type: 'example',
          text: 'Neu thong tin trong nhan bi loi, qua trinh tao protein co the bi anh huong.'
        },
        {
          type: 'question',
          question: 'Qua trinh nao de bi anh huong khi nhan te bao bi ton thuong?',
          options: [
            'Dieu khien hoat dong va su dung thong tin di truyen',
            'Bay hoi nuoc ngoai da',
            'Dong dac kim loai',
            'Tao anh sang mat troi'
          ],
          correctAnswer: 'Dieu khien hoat dong va su dung thong tin di truyen',
          explanation: 'Nhan chua DNA va lien quan den dieu khien tong hop protein, phan chia va nhieu hoat dong cua te bao.'
        }
      ],
      aiText:
        'Trang 4: Nhan te bao la trung tam dieu khien cua nhieu te bao nhan thuc. Trong nhan co vat chat di truyen, giup luu tru thong tin ve dac diem va huong dan qua trinh tong hop protein. Khi te bao can phan chia, thong tin di truyen phai duoc sao chep va phan chia hop ly. Can tranh hieu nham rang nhan lam tat ca moi viec; dung hon la nhan dieu khien bang thong tin di truyen, con cac bao quan khac thuc hien nhieu nhiem vu truc tiep.'
    },
    {
      pageNumber: 5,
      title: 'Te bao thuc vat va dong vat',
      blocks: [
        { type: 'heading', text: 'Giong nhau va khac nhau' },
        {
          type: 'paragraph',
          text: 'Te bao thuc vat va te bao dong vat deu co mang sinh chat, te bao chat va nhan. Te bao thuc vat thuong co thanh te bao, luc lap va khong bao lon.'
        },
        {
          type: 'key_point',
          text: 'Luc lap giup te bao thuc vat quang hop, con thanh te bao giup tao dang va bao ve.'
        },
        {
          type: 'ar_model',
          label: 'AR Animal Cell - Compare with Plant Cell',
          modelUrl: 'local://assets/models/animal-cell-grade8.glb',
          description:
            'Mo hinh AR te bao dong vat de so sanh voi te bao thuc vat trong cung trang bai hoc.'
        },
        {
          type: 'question',
          question: 'Dac diem nao thuong gap o te bao thuc vat ma khong ro o te bao dong vat?',
          options: ['Thanh te bao va luc lap', 'Mang sinh chat', 'Te bao chat', 'Nhan te bao'],
          correctAnswer: 'Thanh te bao va luc lap',
          explanation: 'Ca hai loai te bao deu co mang, te bao chat va nhan; te bao thuc vat thuong co thanh te bao va luc lap.'
        }
      ],
      aiText:
        'Trang 5: Te bao thuc vat va dong vat co nhieu diem chung vi deu la te bao nhan thuc. Diem chung: mang sinh chat, te bao chat, nhan, nhieu bao quan. Diem khac: te bao thuc vat co thanh te bao cellulose giup cung cap do cung, co luc lap de quang hop, co khong bao lon chua dich te bao. Te bao dong vat khong co thanh te bao cellulose va thuong linh hoat hon ve hinh dang. Khi so sanh, nen lap bang: cau truc, co o te bao nao, chuc nang.'
    },
    {
      pageNumber: 6,
      title: 'Tu te bao den mo',
      blocks: [
        { type: 'heading', text: 'Nhieu te bao cung loai tao thanh mo' },
        {
          type: 'paragraph',
          text: 'Trong co the da bao, cac te bao co cau tao va chuc nang gan nhau tap hop thanh mo. Nhieu mo tao thanh co quan.'
        },
        {
          type: 'example',
          text: 'Mo co gom cac te bao co, co kha nang co rut de tao chuyen dong.'
        },
        {
          type: 'question',
          question: 'Thu tu to chuc nao dung tu nho den lon?',
          options: [
            'Te bao - mo - co quan - he co quan - co the',
            'Co the - te bao - mo - co quan',
            'Mo - te bao - he co quan - co quan',
            'Co quan - te bao - co the - mo'
          ],
          correctAnswer: 'Te bao - mo - co quan - he co quan - co the',
          explanation: 'Te bao la cap do nho co ban, nhieu te bao cung chuc nang tao mo, nhieu mo tao co quan.'
        }
      ],
      aiText:
        'Trang 6: Cap do to chuc cua co the da bao gom te bao, mo, co quan, he co quan va co the. Vi du te bao co tao mo co; mo co cung mo lien ket va mo than kinh tham gia tao mot co quan nhu da day hoac tim tuy truong hop. Can hieu day la to chuc theo cap bac: cap nho phoi hop de tao cap lon hon. Khi mot nhom te bao chuyen hoa kem, mo va co quan co the bi anh huong.'
    },
    {
      pageNumber: 7,
      title: 'Trao doi chat va nang luong',
      blocks: [
        { type: 'heading', text: 'Te bao luon trao doi voi moi truong' },
        {
          type: 'paragraph',
          text: 'De song, te bao can lay chat can thiet, bien doi chat va thai san pham khong can thiet. Nang luong giup te bao tong hop chat, van chuyen chat va phan chia.'
        },
        {
          type: 'key_point',
          text: 'Hoat dong cua te bao khong tach roi dinh duong, ho hap va bai tiet o cap co the.'
        },
        {
          type: 'question',
          question: 'Neu te bao khong nhan du oxygen va chat dinh duong, dieu gi co the xay ra?',
          options: [
            'Te bao thieu nang luong va hoat dong kem',
            'Te bao lap tuc tao them luc lap',
            'Nhan te bao bien thanh mang sinh chat',
            'Moi bao quan deu tang kich thuoc vo han'
          ],
          correctAnswer: 'Te bao thieu nang luong va hoat dong kem',
          explanation: 'Oxygen va chat dinh duong lien quan den tao nang luong va vat lieu cho hoat dong te bao.'
        }
      ],
      aiText:
        'Trang 7: Trao doi chat la nen tang cua su song o cap te bao. Te bao nhan glucose, amino acid, acid beo, ion khoang, nuoc va oxygen tuy loai te bao. Te bao bien doi cac chat nay de tao nang luong, tong hop thanh phan moi, sua chua cau truc va thuc hien chuc nang chuyen hoa. San pham thai nhu carbon dioxide va mot so chat khac can duoc dua ra ngoai. Bai nay lien ket voi he tieu hoa, he ho hap, he tuan hoan va he bai tiet: cac he co quan giup moi te bao duoc cung cap va duoc don dep.'
    },
    {
      pageNumber: 8,
      title: 'On tap va van dung',
      blocks: [
        { type: 'heading', text: 'Doc so do, giai thich va van dung' },
        {
          type: 'paragraph',
          text: 'Khi gap cau hoi van dung, hay xac dinh cau truc nao dang duoc noi den, chuc nang cua cau truc do, va he qua neu cau truc do bi anh huong.'
        },
        {
          type: 'example',
          text: 'Neu cau hoi noi te bao can nhieu nang luong, hay nghi den ti the va ATP.'
        },
        {
          type: 'question',
          question: 'Cach tra loi tot cho cau hoi ve cau truc te bao la gi?',
          options: [
            'Neu ten cau truc, chuc nang, va lien he voi tinh huong',
            'Chi chep lai ten bai',
            'Chi noi dap an dung la A',
            'Bo qua du kien trong de'
          ],
          correctAnswer: 'Neu ten cau truc, chuc nang, va lien he voi tinh huong',
          explanation: 'Cau hoi van dung can lien he cau truc - chuc nang - tinh huong cu the.'
        }
      ],
      aiText:
        'Trang 8: Chien luoc on tap bai te bao gom ba buoc. Buoc 1 nhan dien cau truc: mang sinh chat, te bao chat, ti the, ribosome, nhan, thanh te bao, luc lap. Buoc 2 noi chuc nang bang cau ngan gon. Buoc 3 gan voi tinh huong: vi du te bao co can nang luong nen can nhieu ti the; te bao thuc vat quang hop nen co luc lap; mang sinh chat hong thi trao doi chat bi roi loan; nhan ton thuong thi thong tin di truyen va dieu khien hoat dong bi anh huong. Khi tao cau hoi, nen tron nhan biet, thong hieu va van dung.'
    }
  ]
};

export const mathLesson: Lesson = {
  id: 'les-math8-linear-001',
  title: 'Phuong trinh bac nhat mot an',
  subject: 'Toan 8',
  grade: '8',
  pages: [
    {
      pageNumber: 1,
      title: 'Dang co ban',
      blocks: [
        { type: 'heading', text: 'Giai phuong trinh bang phep bien doi tuong duong' },
        { type: 'paragraph', text: 'Phuong trinh bac nhat mot an co the dua ve dang ax + b = 0 voi a khac 0.' },
        { type: 'question', question: 'Nghiem cua 2x + 6 = 0 la gi?', options: ['x = -3', 'x = 3', 'x = 6', 'x = -6'], correctAnswer: 'x = -3', explanation: '2x + 6 = 0 nen 2x = -6 va x = -3.' }
      ],
      aiText: 'Bai Toan 8 ve phuong trinh bac nhat mot an. Can dua phuong trinh ve ax + b = 0, sau do chuyen ve va chia cho he so cua x. Vi du 2x + 6 = 0, chuyen 6 sang ve phai thanh 2x = -6, chia 2 duoc x = -3.'
    },
    {
      pageNumber: 2,
      title: 'Loi sai thuong gap',
      blocks: [
        { type: 'heading', text: 'Can doi dau khi chuyen ve' },
        { type: 'paragraph', text: 'Khi chuyen mot hang tu tu ve nay sang ve kia, phai doi dau hang tu do.' },
        { type: 'question', question: 'Khi chuyen +5 sang ve phai, no thanh gi?', options: ['-5', '+5', '0', '5x'], correctAnswer: '-5', explanation: 'Chuyen ve thi doi dau.' }
      ],
      aiText: 'Loi sai pho bien khi giai phuong trinh la quen doi dau luc chuyen ve. Hoc sinh nen viet ro tung buoc va thu lai nghiem vao phuong trinh ban dau.'
    }
  ]
};

export const literatureLesson: Lesson = {
  id: 'les-lit8-reading-001',
  title: 'Doc hieu van ban tu su',
  subject: 'Ngu van 8',
  grade: '8',
  pages: [
    {
      pageNumber: 1,
      title: 'Nhan vat va su viec',
      blocks: [
        { type: 'heading', text: 'Doc de tim ai lam gi va vi sao' },
        { type: 'paragraph', text: 'Khi doc van ban tu su, can xac dinh nhan vat, su viec chinh, ngoi ke va y nghia cua chi tiet.' },
        { type: 'question', question: 'Yeu to nao giup hieu dien bien cau chuyen?', options: ['Su viec chinh', 'Cong thuc hoa hoc', 'Bang cuu chuong', 'So do mach dien'], correctAnswer: 'Su viec chinh', explanation: 'Su viec chinh tao nen mach truyen va giup hieu dien bien.' }
      ],
      aiText: 'Bai Ngu van 8 ve doc hieu van ban tu su. Trong khi doc, hoc sinh can tim nhan vat, su viec chinh, ngoi ke, chi tiet tieu bieu va thong diep. Cau tra loi tot can co dan chung ngan tu van ban.'
    }
  ]
};

export const englishLesson: Lesson = {
  id: 'les-eng8-future-001',
  title: 'Future plans with be going to',
  subject: 'Tieng Anh 8',
  grade: '8',
  pages: [
    {
      pageNumber: 1,
      title: 'Plans and intentions',
      blocks: [
        { type: 'heading', text: 'Use be going to for planned actions' },
        { type: 'paragraph', text: 'We use am/is/are going to plus verb to talk about plans or intentions.' },
        { type: 'question', question: 'Choose the correct sentence.', options: ['I am going to study tonight.', 'I going study tonight.', 'I am go to study tonight.', 'I studies tonight going.'], correctAnswer: 'I am going to study tonight.', explanation: 'The correct form is subject + am/is/are + going to + verb.' }
      ],
      aiText: 'English 8 lesson: be going to is used for future plans and intentions. Form: subject + am/is/are + going to + base verb. Example: I am going to study tonight. Negative: I am not going to play games. Question: Are you going to review Biology?'
    }
  ]
};

export const todayLessons: Lesson[] = [biologyLongLesson, mathLesson, literatureLesson, englishLesson];
export const mockLessons: Lesson[] = [biologyLongLesson, lesson, mathLesson, literatureLesson, englishLesson];

export const assignment: Assignment = {
  id: 'asg1',
  lessonId: lesson.id,
  title: 'Bai tap ve nha',
  dueDate: '2026-05-05',
  completed: false
};

export const quiz: Quiz = {
  id: 'quiz1',
  lessonId: lesson.id,
  questions: ['Cau 1', 'Cau 2', 'Cau 3']
};

export const mastery: Mastery = {
  id: 'mas1',
  studentId: 'stu1',
  topic: lesson.title,
  level: 75
};

export const studentSchedule = [
  {
    id: 'sch-1',
    time: '07:30 - 08:15',
    subject: 'Biology',
    room: 'Lab 2',
    teacher: 'Ms. Linh',
    status: 'Current'
  },
  {
    id: 'sch-2',
    time: '08:25 - 09:10',
    subject: 'Math',
    room: 'Room 8A',
    teacher: 'Mr. Nam',
    status: 'Next'
  },
  {
    id: 'sch-3',
    time: '09:25 - 10:10',
    subject: 'Literature',
    room: 'Room 8A',
    teacher: 'Ms. Hoa',
    status: 'Today'
  },
  {
    id: 'sch-4',
    time: '14:00 - 14:45',
    subject: 'Self-study',
    room: 'Library',
    teacher: 'AI Tutor',
    status: 'Recommended'
  }
];

export const studentGrades = [
  {
    subject: 'Biology',
    recentScore: 8.5,
    mastery: 78,
    trend: 'Improving',
    note: 'Good progress in cell structure.'
  },
  {
    subject: 'Math',
    recentScore: 7.2,
    mastery: 64,
    trend: 'Needs practice',
    note: 'Review equation transformation.'
  },
  {
    subject: 'Literature',
    recentScore: 8.0,
    mastery: 72,
    trend: 'Stable',
    note: 'Reading comprehension is developing.'
  }
];

export const attendanceSummary = {
  presentDays: 18,
  absentDays: 1,
  lateDays: 2,
  currentMonth: 'May'
};

export const studentAssignments = [
  {
    id: 'asg-card-1',
    title: 'Biology: Cell Structure Review',
    subject: 'Biology',
    dueDate: 'Today',
    status: 'In progress',
    action: 'Continue'
  },
  {
    id: 'asg-card-2',
    title: 'Math: Linear Equation Practice',
    subject: 'Math',
    dueDate: 'Tomorrow',
    status: 'Not started',
    action: 'Start'
  },
  {
    id: 'asg-card-3',
    title: 'Literature: Reading Reflection',
    subject: 'Literature',
    dueDate: 'Friday',
    status: 'Submitted',
    action: 'View'
  }
];

export const weeklyStudy = [
  { day: 'Mon', minutes: 25 },
  { day: 'Tue', minutes: 40 },
  { day: 'Wed', minutes: 30 },
  { day: 'Thu', minutes: 35 },
  { day: 'Fri', minutes: 20 }
];

export const schoolNotices = [
  {
    id: 'notice-1',
    title: 'Biology quiz tomorrow',
    date: 'Tomorrow',
    message: 'Review cell structure and organelles.'
  },
  {
    id: 'notice-2',
    title: 'Library self-study hour',
    date: 'Today',
    message: 'The library is open for Grade 8 self-study from 14:00.'
  },
  {
    id: 'notice-3',
    title: 'Parent meeting reminder',
    date: 'Friday',
    message: 'A progress summary will be prepared for guardians.'
  }
];

export const groupAssignments: GroupAssignment[] = [
  {
    id: 'group_cell_001',
    title: 'Group Discussion: Why is the cell the basic unit of life?',
    subject: 'Biology',
    lessonId: lesson.id,
    teacherName: 'Ms. Linh',
    dueDate: 'Today',
    status: 'in_progress',
    instruction:
      'Discuss the lesson and prepare a short group answer explaining why the cell is considered the basic unit of life.',
    expectedOutput: 'A short explanation with 3 key points.',
    groupName: 'Group A',
    members: [
      { id: 'student_001', name: 'Nguyen Van A', role: 'leader', avatarLabel: 'A' },
      { id: 'student_002', name: 'Tran Minh B', role: 'member', avatarLabel: 'B' },
      { id: 'student_003', name: 'Le Khanh C', role: 'member', avatarLabel: 'C' }
    ],
    tasks: [
      { id: 'task_1', title: 'Read the current lesson page', assignedToStudentId: 'student_001', status: 'done' },
      { id: 'task_2', title: 'Find 3 key ideas about cells', assignedToStudentId: 'student_002', status: 'doing' },
      { id: 'task_3', title: 'Write the final group answer', assignedToStudentId: 'student_003', status: 'todo' }
    ],
    discussion: [
      {
        id: 'msg_1',
        senderId: 'student_002',
        senderName: 'Tran Minh B',
        text: 'I think the first key point is that the cell is the basic unit of life.',
        createdAt: '09:15',
        source: 'mock'
      },
      {
        id: 'msg_2',
        senderId: 'student_003',
        senderName: 'Le Khanh C',
        text: 'We should also mention that cells participate in life activities.',
        createdAt: '09:17',
        source: 'mock'
      }
    ],
    submission: {
      answerText: ''
    }
  }
];
