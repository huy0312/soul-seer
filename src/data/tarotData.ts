
export interface TarotCardData {
  id: string;
  name: string;
  meaning: string;
  description: string;
  keywords: string[];
  image: string;
}

export const majorArcana: TarotCardData[] = [
  {
    id: 'fool',
    name: 'The Fool',
    meaning: 'Khởi đầu mới, phiêu lưu, tiềm năng vô hạn',
    description: 'Bạn đang đứng trước một hành trình mới đầy hứa hẹn. Hãy tin tương vào bản thân và dám mạo hiểm.',
    keywords: ['khởi đầu', 'phiêu lưu', 'tự do', 'tiềm năng'],
    image: '🃏'
  },
  {
    id: 'magician',
    name: 'The Magician',
    meaning: 'Ý chí, quyền năng, kỹ năng, tập trung',
    description: 'Bạn có tất cả những gì cần thiết để đạt được mục tiêu. Hãy tập trung và hành động.',
    keywords: ['ý chí', 'quyền năng', 'kỹ năng', 'sáng tạo'],
    image: '🎩'
  },
  {
    id: 'high-priestess',
    name: 'The High Priestess',
    meaning: 'Trực giác, bí ẩn, tiềm thức, hiểu biết sâu sắc',
    description: 'Lắng nghe tiếng nói bên trong bạn. Câu trả lời bạn tìm kiếm đã có trong tim.',
    keywords: ['trực giác', 'bí ẩn', 'tiềm thức', 'hiểu biết'],
    image: '🌙'
  },
  {
    id: 'empress',
    name: 'The Empress',
    meaning: 'Sự nuôi dưỡng, tình mẫu tử, sáng tạo, phong phú',
    description: 'Thời gian của sự phát triển và thịnh vượng. Hãy ấp ủ những dự án và mối quan hệ.',
    keywords: ['nuôi dưỡng', 'sáng tạo', 'phong phú', 'tình yêu'],
    image: '👑'
  },
  {
    id: 'emperor',
    name: 'The Emperor',
    meaning: 'Quyền lực, lãnh đạo, cấu trúc, kỷ luật',
    description: 'Bạn cần thể hiện tính lãnh đạo và tạo ra trật tự trong cuộc sống.',
    keywords: ['quyền lực', 'lãnh đạo', 'kỷ luật', 'trật tự'],
    image: '👑'
  },
  {
    id: 'hierophant',
    name: 'The Hierophant',
    meaning: 'Truyền thống, giáo dục, tâm linh, hướng dẫn',
    description: 'Tìm kiếm sự hướng dẫn từ những người có kinh nghiệm và tuân theo các giá trị truyền thống.',
    keywords: ['truyền thống', 'giáo dục', 'tâm linh', 'hướng dẫn'],
    image: '⛪'
  },
  {
    id: 'lovers',
    name: 'The Lovers',
    meaning: 'Tình yêu, mối quan hệ, lựa chọn, hòa hợp',
    description: 'Một mối quan hệ quan trọng hoặc quyết định lớn đang chờ đợi bạn.',
    keywords: ['tình yêu', 'quan hệ', 'lựa chọn', 'hòa hợp'],
    image: '💕'
  },
  {
    id: 'chariot',
    name: 'The Chariot',
    meaning: 'Chiến thắng, ý chí, kiểm soát, tiến bộ',
    description: 'Bạn có khả năng vượt qua mọi khó khăn nhờ vào quyết tâm và tập trung.',
    keywords: ['chiến thắng', 'ý chí', 'kiểm soát', 'tiến bộ'],
    image: '🏆'
  },
  {
    id: 'strength',
    name: 'Strength',
    meaning: 'Sức mạnh nội tại, can đảm, kiên nhẫn, lòng trắc ẩn',
    description: 'Sức mạnh thật sự đến từ bên trong. Hãy dùng lòng trắc ẩn thay vì bạo lực.',
    keywords: ['sức mạnh', 'can đảm', 'kiên nhẫn', 'trắc ẩn'],
    image: '🦁'
  },
  {
    id: 'hermit',
    name: 'The Hermit',
    meaning: 'Tìm kiếm nội tâm, khôn ngoan, hướng dẫn, chiêm nghiệm',
    description: 'Đây là lúc để rút lui và tìm kiếm sự khôn ngoan từ bên trong.',
    keywords: ['nội tâm', 'khôn ngoan', 'hướng dẫn', 'chiêm nghiệm'],
    image: '🕯️'
  }
];

export const getRandomCards = (count: number): TarotCardData[] => {
  const shuffled = [...majorArcana].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getTopicSpecificInterpretation = (card: TarotCardData, topic: string): string => {
  const interpretations: Record<string, Record<string, string>> = {
    love: {
      'fool': 'Một tình yêu mới sắp đến với bạn. Hãy mở lòng đón nhận.',
      'magician': 'Bạn có khả năng thu hút và giữ chân người bạn yêu.',
      'high-priestess': 'Hãy tin vào trực giác của bạn trong các mối quan hệ.',
      'empress': 'Tình yêu và sự ấm áp sẽ bao trọn cuộc sống của bạn.',
      'emperor': 'Bạn cần thể hiện sự chững chạc trong tình yêu.',
      'hierophant': 'Một mối quan hệ nghiêm túc và lâu dài đang chờ bạn.',
      'lovers': 'Đây là thời điểm hoàn hảo cho tình yêu và cam kết.',
      'chariot': 'Bạn sẽ vượt qua mọi khó khăn trong tình yêu.',
      'strength': 'Tình yêu đích thực cần sự kiên nhẫn và hiểu biết.',
      'hermit': 'Hãy dành thời gian tìm hiểu bản thân trước khi yêu ai đó.'
    },
    career: {
      'fool': 'Một cơ hội nghề nghiệp mới sắp xuất hiện.',
      'magician': 'Bạn có tất cả kỹ năng cần thiết để thành công.',
      'high-priestess': 'Hãy tin vào trực giác trong các quyết định nghề nghiệp.',
      'empress': 'Sự nghiệp của bạn sẽ phát triển mạnh mẽ.',
      'emperor': 'Đây là lúc để thể hiện khả năng lãnh đạo của bạn.',
      'hierophant': 'Học hỏi từ những người có kinh nghiệm sẽ giúp bạn tiến xa.',
      'lovers': 'Bạn cần đưa ra lựa chọn quan trọng trong sự nghiệp.',
      'chariot': 'Sự kiên trì sẽ đưa bạn đến thành công.',
      'strength': 'Khả năng lãnh đạo và ảnh hưởng của bạn sẽ được ghi nhận.',
      'hermit': 'Đây là lúc để suy ngẫm về hướng đi nghề nghiệp.'
    },
    money: {
      'fool': 'Một cơ hội đầu tư mới đang chờ đợi bạn.',
      'magician': 'Bạn có khả năng tạo ra của cải từ tài năng của mình.',
      'high-priestess': 'Hãy cẩn thận và suy nghĩ kỹ trước khi đầu tư.',
      'empress': 'Tài chính của bạn sẽ dồi dào và phong phú.',
      'emperor': 'Quản lý tài chính một cách có kỷ luật sẽ mang lại thành công.',
      'hierophant': 'Tuân theo các nguyên tắc tài chính truyền thống.',
      'lovers': 'Quyết định tài chính quan trọng đang chờ bạn.',
      'chariot': 'Sự kiên trì sẽ giúp bạn vượt qua khó khăn tài chính.',
      'strength': 'Kiểm soát chi tiêu và đầu tư khôn ngoan.',
      'hermit': 'Dành thời gian lập kế hoạch tài chính dài hạn.'
    },
    family: {
      'fool': 'Một thành viên mới có thể gia nhập gia đình.',
      'magician': 'Bạn có khả năng hòa giải các mâu thuẫn trong gia đình.',
      'high-priestess': 'Lắng nghe và hiểu các thành viên trong gia đình.',
      'empress': 'Gia đình bạn sẽ đầm ấm và hạnh phúc.',
      'emperor': 'Bạn cần thể hiện vai trò người trụ cột trong gia đình.',
      'hierophant': 'Truyền thống gia đình sẽ được tôn vinh.',
      'lovers': 'Các mối quan hệ gia đình sẽ được cải thiện.',
      'chariot': 'Gia đình bạn sẽ vượt qua mọi thử thách.',
      'strength': 'Tình yêu thương gia đình sẽ giúp bạn mạnh mẽ hơn.',
      'hermit': 'Dành thời gian chất lượng với gia đình.'
    },
    general: {
      'fool': 'Một chương mới trong cuộc đời bạn sắp bắt đầu.',
      'magician': 'Bạn có đủ khả năng để thực hiện mọi điều mình mong muốn.',
      'high-priestess': 'Hãy tin tưởng vào trực giác và sự khôn ngoan bên trong.',
      'empress': 'Cuộc sống bạn sẽ tràn ngập niềm vui và thịnh vượng.',
      'emperor': 'Đây là lúc để thể hiện khả năng lãnh đạo và kiểm soát cuộc sống.',
      'hierophant': 'Theo đuổi sự học hỏi và phát triển tâm linh.',
      'lovers': 'Những lựa chọn quan trọng đang chờ đợi bạn.',
      'chariot': 'Thành công sẽ đến nhờ sự quyết tâm và tập trung.',
      'strength': 'Sức mạnh nội tại sẽ giúp bạn vượt qua mọi thử thách.',
      'hermit': 'Đây là thời gian để tự suy ngẫm và tìm kiếm sự khôn ngoan.'
    }
  };

  return interpretations[topic]?.[card.id] || card.description;
};
