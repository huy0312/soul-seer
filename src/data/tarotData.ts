
export interface TarotCardData {
  id: string;
  name: string;
  meaning: string;
  description: string;
  keywords: string[];
  image: string;
  type: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
}

export const majorArcana: TarotCardData[] = [
  {
    id: 'fool',
    name: 'The Fool',
    meaning: 'Khởi đầu mới, phiêu lưu, tiềm năng vô hạn',
    description: 'Bạn đang đứng trước một hành trình mới đầy hứa hẹn. Hãy tin tương vào bản thân và dám mạo hiểm.',
    keywords: ['khởi đầu', 'phiêu lưu', 'tự do', 'tiềm năng'],
    image: '🃏',
    type: 'major'
  },
  {
    id: 'magician',
    name: 'The Magician',
    meaning: 'Ý chí, quyền năng, kỹ năng, tập trung',
    description: 'Bạn có tất cả những gì cần thiết để đạt được mục tiêu. Hãy tập trung và hành động.',
    keywords: ['ý chí', 'quyền năng', 'kỹ năng', 'sáng tạo'],
    image: '🎩',
    type: 'major'
  },
  {
    id: 'high-priestess',
    name: 'The High Priestess',
    meaning: 'Trực giác, bí ẩn, tiềm thức, hiểu biết sâu sắc',
    description: 'Lắng nghe tiếng nói bên trong bạn. Câu trả lời bạn tìm kiếm đã có trong tim.',
    keywords: ['trực giác', 'bí ẩn', 'tiềm thức', 'hiểu biết'],
    image: '🌙',
    type: 'major'
  },
  {
    id: 'empress',
    name: 'The Empress',
    meaning: 'Sự nuôi dưỡng, tình mẫu tử, sáng tạo, phong phú',
    description: 'Thời gian của sự phát triển và thịnh vượng. Hãy ấp ủ những dự án và mối quan hệ.',
    keywords: ['nuôi dưỡng', 'sáng tạo', 'phong phú', 'tình yêu'],
    image: '👑',
    type: 'major'
  },
  {
    id: 'emperor',
    name: 'The Emperor',
    meaning: 'Quyền lực, lãnh đạo, cấu trúc, kỷ luật',
    description: 'Bạn cần thể hiện tính lãnh đạo và tạo ra trật tự trong cuộc sống.',
    keywords: ['quyền lực', 'lãnh đạo', 'kỷ luật', 'trật tự'],
    image: '🏛️',
    type: 'major'
  },
  {
    id: 'hierophant',
    name: 'The Hierophant',
    meaning: 'Truyền thống, giáo dục, tâm linh, hướng dẫn',
    description: 'Tìm kiếm sự hướng dẫn từ những người có kinh nghiệm và tuân theo các giá trị truyền thống.',
    keywords: ['truyền thống', 'giáo dục', 'tâm linh', 'hướng dẫn'],
    image: '⛪',
    type: 'major'
  },
  {
    id: 'lovers',
    name: 'The Lovers',
    meaning: 'Tình yêu, mối quan hệ, lựa chọn, hòa hợp',
    description: 'Một mối quan hệ quan trọng hoặc quyết định lớn đang chờ đợi bạn.',
    keywords: ['tình yêu', 'quan hệ', 'lựa chọn', 'hòa hợp'],
    image: '💕',
    type: 'major'
  },
  {
    id: 'chariot',
    name: 'The Chariot',
    meaning: 'Chiến thắng, ý chí, kiểm soát, tiến bộ',
    description: 'Bạn có khả năng vượt qua mọi khó khăn nhờ vào quyết tâm và tập trung.',
    keywords: ['chiến thắng', 'ý chí', 'kiểm soát', 'tiến bộ'],
    image: '🏆',
    type: 'major'
  },
  {
    id: 'strength',
    name: 'Strength',
    meaning: 'Sức mạnh nội tại, can đảm, kiên nhẫn, lòng trắc ẩn',
    description: 'Sức mạnh thật sự đến từ bên trong. Hãy dùng lòng trắc ẩn thay vì bạo lực.',
    keywords: ['sức mạnh', 'can đảm', 'kiên nhẫn', 'trắc ẩn'],
    image: '🦁',
    type: 'major'
  },
  {
    id: 'hermit',
    name: 'The Hermit',
    meaning: 'Tìm kiếm nội tâm, khôn ngoan, hướng dẫn, chiêm nghiệm',
    description: 'Đây là lúc để rút lui và tìm kiếm sự khôn ngoan từ bên trong.',
    keywords: ['nội tâm', 'khôn ngoan', 'hướng dẫn', 'chiêm nghiệm'],
    image: '🕯️',
    type: 'major'
  },
  {
    id: 'wheel-of-fortune',
    name: 'Wheel of Fortune',
    meaning: 'Vận mệnh, thay đổi, chu kỳ, cơ hội',
    description: 'Bánh xe vận mệnh đang quay. Sự thay đổi tích cực đang đến gần.',
    keywords: ['vận mệnh', 'thay đổi', 'chu kỳ', 'cơ hội'],
    image: '☸️',
    type: 'major'
  },
  {
    id: 'justice',
    name: 'Justice',
    meaning: 'Công lý, cân bằng, chân lý, hậu quả',
    description: 'Mọi hành động đều có hậu quả tương ứng. Công lý sẽ được thực thi.',
    keywords: ['công lý', 'cân bằng', 'chân lý', 'quyết định'],
    image: '⚖️',
    type: 'major'
  },
  {
    id: 'hanged-man',
    name: 'The Hanged Man',
    meaning: 'Hy sinh, kiên nhẫn, từ bỏ, góc nhìn mới',
    description: 'Đôi khi cần dừng lại và nhìn nhận mọi thứ từ góc độ khác.',
    keywords: ['hy sinh', 'kiên nhẫn', 'từ bỏ', 'thay đổi'],
    image: '🙃',
    type: 'major'
  },
  {
    id: 'death',
    name: 'Death',
    meaning: 'Kết thúc, chuyển đổi, tái sinh, thay đổi lớn',
    description: 'Một chương cũ đang kết thúc để mở đường cho sự khởi đầu mới.',
    keywords: ['kết thúc', 'chuyển đổi', 'tái sinh', 'thay đổi'],
    image: '💀',
    type: 'major'
  },
  {
    id: 'temperance',
    name: 'Temperance',
    meaning: 'Cân bằng, điều hòa, kiên nhẫn, hòa hợp',
    description: 'Sự điều hòa và cân bằng sẽ mang lại sự bình yên trong tâm hồn.',
    keywords: ['cân bằng', 'điều hòa', 'kiên nhẫn', 'hòa hợp'],
    image: '👼',
    type: 'major'
  },
  {
    id: 'devil',
    name: 'The Devil',
    meaning: 'Ràng buộc, cám dỗ, vật chất, giải phóng',
    description: 'Bạn có thể đang bị ràng buộc bởi những thói quen xấu hoặc suy nghĩ tiêu cực.',
    keywords: ['ràng buộc', 'cám dỗ', 'vật chất', 'giải phóng'],
    image: '😈',
    type: 'major'
  },
  {
    id: 'tower',
    name: 'The Tower',
    meaning: 'Phá hủy, thay đổi đột ngột, giác ngộ, giải phóng',
    description: 'Những cấu trúc cũ sẽ bị phá vỡ để mở đường cho sự đổi mới.',
    keywords: ['phá hủy', 'thay đổi', 'giác ngộ', 'giải phóng'],
    image: '🗼',
    type: 'major'
  },
  {
    id: 'star',
    name: 'The Star',
    meaning: 'Hy vọng, cảm hứng, chữa lành, tương lai sáng lạn',
    description: 'Sau cơn bão, ánh sao hy vọng đang tỏa sáng dẫn đường cho bạn.',
    keywords: ['hy vọng', 'cảm hứng', 'chữa lành', 'tương lai'],
    image: '⭐',
    type: 'major'
  },
  {
    id: 'moon',
    name: 'The Moon',
    meaning: 'Ảo tưởng, trực giác, tiềm thức, bí ẩn',
    description: 'Không phải mọi thứ đều như bề ngoài. Hãy tin vào trực giác của bạn.',
    keywords: ['ảo tưởng', 'trực giác', 'tiềm thức', 'bí ẩn'],
    image: '🌕',
    type: 'major'
  },
  {
    id: 'sun',
    name: 'The Sun',
    meaning: 'Niềm vui, thành công, năng lượng tích cực, thành tựu',
    description: 'Ánh mặt trời chiếu sáng cuộc đời bạn. Thành công và hạnh phúc đang chờ đợi.',
    keywords: ['niềm vui', 'thành công', 'năng lượng', 'thành tựu'],
    image: '☀️',
    type: 'major'
  },
  {
    id: 'judgement',
    name: 'Judgement',
    meaning: 'Phán xét, tái sinh, tha thứ, thức tỉnh',
    description: 'Đây là lúc để đánh giá lại cuộc sống và đưa ra những quyết định quan trọng.',
    keywords: ['phán xét', 'tái sinh', 'tha thứ', 'thức tỉnh'],
    image: '📯',
    type: 'major'
  },
  {
    id: 'world',
    name: 'The World',
    meaning: 'Hoàn thành, thành tựu, tổng hòa, chu kỳ mới',
    description: 'Bạn đã đạt được sự hoàn thiện và sẵn sàng cho một chu kỳ mới.',
    keywords: ['hoàn thành', 'thành tựu', 'tổng hòa', 'chu kỳ'],
    image: '🌍',
    type: 'major'
  }
];

export const minorArcana: TarotCardData[] = [
  // Wands (Gậy) - Fire Element
  {
    id: 'ace-of-wands',
    name: 'Ace of Wands',
    meaning: 'Khởi đầu mới, cảm hứng, tiềm năng sáng tạo',
    description: 'Một cơ hội mới đầy năng lượng và sáng tạo đang chờ đợi bạn.',
    keywords: ['khởi đầu', 'cảm hứng', 'sáng tạo', 'năng lượng'],
    image: '🔥',
    type: 'minor',
    suit: 'wands'
  },
  {
    id: 'two-of-wands',
    name: 'Two of Wands',
    meaning: 'Lập kế hoạch, tiến bộ cá nhân, quyết định tương lai',
    description: 'Bạn đang lên kế hoạch cho tương lai và có tầm nhìn rõ ràng.',
    keywords: ['kế hoạch', 'tầm nhìn', 'quyết định', 'tiến bộ'],
    image: '🗺️',
    type: 'minor',
    suit: 'wands'
  },
  {
    id: 'three-of-wands',
    name: 'Three of Wands',
    meaning: 'Mở rộng, dự đoán, thương mại, khám phá',
    description: 'Những nỗ lực của bạn đang bắt đầu mang lại kết quả tích cực.',
    keywords: ['mở rộng', 'thương mại', 'khám phá', 'kết quả'],
    image: '🚢',
    type: 'minor',
    suit: 'wands'
  },
  {
    id: 'four-of-wands',
    name: 'Four of Wands',
    meaning: 'Ăn mừng, hòa hợp, nhà cửa, cộng đồng',
    description: 'Thời gian để ăn mừng thành tựu và tận hưởng sự ổn định.',
    keywords: ['ăn mừng', 'hòa hợp', 'ổn định', 'cộng đồng'],
    image: '🎉',
    type: 'minor',
    suit: 'wands'
  },
  {
    id: 'five-of-wands',
    name: 'Five of Wands',
    meaning: 'Xung đột, cạnh tranh, thử thách, bất đồng',
    description: 'Bạn đang đối mặt với cạnh tranh nhưng đây là cơ hội để phát triển.',
    keywords: ['xung đột', 'cạnh tranh', 'thử thách', 'phát triển'],
    image: '⚔️',
    type: 'minor',
    suit: 'wands'
  },
  {
    id: 'six-of-wands',
    name: 'Six of Wands',
    meaning: 'Chiến thắng, thành công, sự công nhận, tự tin',
    description: 'Thành công và sự công nhận đang đến với bạn.',
    keywords: ['chiến thắng', 'thành công', 'công nhận', 'tự tin'],
    image: '🏆',
    type: 'minor',
    suit: 'wands'
  },
  {
    id: 'seven-of-wands',
    name: 'Seven of Wands',
    meaning: 'Thử thách, bảo vệ, kiên trì, quyết tâm',
    description: 'Bạn cần đứng vững và bảo vệ vị trí của mình.',
    keywords: ['thử thách', 'bảo vệ', 'kiên trì', 'quyết tâm'],
    image: '🛡️',
    type: 'minor',
    suit: 'wands'
  },
  {
    id: 'eight-of-wands',
    name: 'Eight of Wands',
    meaning: 'Tốc độ, tiến bộ nhanh, tin tức, hành động',
    description: 'Mọi thứ đang diễn ra rất nhanh chóng và tích cực.',
    keywords: ['tốc độ', 'tiến bộ', 'tin tức', 'hành động'],
    image: '💨',
    type: 'minor',
    suit: 'wands'
  },
  {
    id: 'nine-of-wands',
    name: 'Nine of Wands',
    meaning: 'Kiên trì, bảo vệ, gần hoàn thành, sức mạnh',
    description: 'Bạn gần đạt được mục tiêu, hãy kiên trì thêm chút nữa.',
    keywords: ['kiên trì', 'bảo vệ', 'hoàn thành', 'sức mạnh'],
    image: '🏁',
    type: 'minor',
    suit: 'wands'
  },
  {
    id: 'ten-of-wands',
    name: 'Ten of Wands',
    meaning: 'Gánh nặng, trách nhiệm, căng thẳng, hoàn thành',
    description: 'Bạn đang gánh vác nhiều trách nhiệm nhưng sắp hoàn thành.',
    keywords: ['gánh nặng', 'trách nhiệm', 'căng thẳng', 'hoàn thành'],
    image: '📦',
    type: 'minor',
    suit: 'wands'
  },
  {
    id: 'page-of-wands',
    name: 'Page of Wands',
    meaning: 'Nhiệt huyết, khám phá, tin tức, khởi đầu',
    description: 'Tin tức mới hoặc cơ hội thú vị đang đến với bạn.',
    keywords: ['nhiệt huyết', 'khám phá', 'tin tức', 'khởi đầu'],
    image: '👦',
    type: 'minor',
    suit: 'wands'
  },
  {
    id: 'knight-of-wands',
    name: 'Knight of Wands',
    meaning: 'Hành động, phiêu lưu, xung động, năng lượng',
    description: 'Đã đến lúc hành động quyết liệt và theo đuổi đam mê.',
    keywords: ['hành động', 'phiêu lưu', 'xung động', 'năng lượng'],
    image: '🐎',
    type: 'minor',
    suit: 'wands'
  },
  {
    id: 'queen-of-wands',
    name: 'Queen of Wands',
    meaning: 'Tự tin, quyến rũ, quyết đoán, độc lập',
    description: 'Thể hiện sự tự tin và quyến rũ tự nhiên của bạn.',
    keywords: ['tự tin', 'quyến rũ', 'quyết đoán', 'độc lập'],
    image: '👸',
    type: 'minor',
    suit: 'wands'
  },
  {
    id: 'king-of-wands',
    name: 'King of Wands',
    meaning: 'Lãnh đạo, tầm nhìn, doanh nhân, kinh nghiệm',
    description: 'Bạn có khả năng lãnh đạo và tầm nhìn xa để thành công.',
    keywords: ['lãnh đạo', 'tầm nhìn', 'doanh nhân', 'kinh nghiệm'],
    image: '🤴',
    type: 'minor',
    suit: 'wands'
  },

  // Cups (Chén) - Water Element
  {
    id: 'ace-of-cups',
    name: 'Ace of Cups',
    meaning: 'Tình yêu mới, cảm xúc, tâm linh, trực giác',
    description: 'Tình yêu và cảm xúc mới đang đổ đầy trái tim bạn.',
    keywords: ['tình yêu', 'cảm xúc', 'tâm linh', 'trực giác'],
    image: '💖',
    type: 'minor',
    suit: 'cups'
  },
  {
    id: 'two-of-cups',
    name: 'Two of Cups',
    meaning: 'Mối quan hệ, tình yêu, hợp tác, kết nối',
    description: 'Một mối quan hệ đẹp và hài hòa đang phát triển.',
    keywords: ['quan hệ', 'tình yêu', 'hợp tác', 'kết nối'],
    image: '💑',
    type: 'minor',
    suit: 'cups'
  },
  {
    id: 'three-of-cups',
    name: 'Three of Cups',
    meaning: 'Tình bạn, ăn mừng, cộng đồng, vui vẻ',
    description: 'Thời gian vui vẻ với bạn bè và những người thân yêu.',
    keywords: ['tình bạn', 'ăn mừng', 'cộng đồng', 'vui vẻ'],
    image: '🥂',
    type: 'minor',
    suit: 'cups'
  },
  {
    id: 'four-of-cups',
    name: 'Four of Cups',
    meaning: 'Thờ ơ, thiền định, bỏ lỡ cơ hội, nội tâm',
    description: 'Bạn có thể đang bỏ lỡ những cơ hội tốt xung quanh.',
    keywords: ['thờ ơ', 'thiền định', 'cơ hội', 'nội tâm'],
    image: '🧘',
    type: 'minor',
    suit: 'cups'
  },
  {
    id: 'five-of-cups',
    name: 'Five of Cups',
    meaning: 'Thất vọng, tổn thất, buồn bã, hối tiếc',
    description: 'Mặc dù có tổn thất, vẫn còn hy vọng và cơ hội phục hồi.',
    keywords: ['thất vọng', 'tổn thất', 'buồn bã', 'hy vọng'],
    image: '😢',
    type: 'minor',
    suit: 'cups'
  },
  {
    id: 'six-of-cups',
    name: 'Six of Cups',
    meaning: 'Hoài niệm, quá khứ, tuổi thơ, lòng tốt',
    description: 'Những kỷ niệm đẹp từ quá khứ mang lại niềm vui.',
    keywords: ['hoài niệm', 'quá khứ', 'tuổi thơ', 'lòng tốt'],
    image: '🎁',
    type: 'minor',
    suit: 'cups'
  },
  {
    id: 'seven-of-cups',
    name: 'Seven of Cups',
    meaning: 'Ảo tưởng, lựa chọn, mơ mộng, nhầm lẫn',
    description: 'Có quá nhiều lựa chọn, hãy tập trung vào thực tế.',
    keywords: ['ảo tưởng', 'lựa chọn', 'mơ mộng', 'tập trung'],
    image: '☁️',
    type: 'minor',
    suit: 'cups'
  },
  {
    id: 'eight-of-cups',
    name: 'Eight of Cups',
    meaning: 'Rời bỏ, tìm kiếm, thất vọng, hành trình tâm linh',
    description: 'Đã đến lúc rời bỏ những gì không còn phù hợp.',
    keywords: ['rời bỏ', 'tìm kiếm', 'hành trình', 'tâm linh'],
    image: '🚶',
    type: 'minor',
    suit: 'cups'
  },
  {
    id: 'nine-of-cups',
    name: 'Nine of Cups',
    meaning: 'Thỏa mãn, hạnh phúc, điều ước, thành tựu',
    description: 'Những mong muốn của bạn đang được thực hiện.',
    keywords: ['thỏa mãn', 'hạnh phúc', 'điều ước', 'thành tựu'],
    image: '😊',
    type: 'minor',
    suit: 'cups'
  },
  {
    id: 'ten-of-cups',
    name: 'Ten of Cups',
    meaning: 'Hạnh phúc gia đình, hoàn thành cảm xúc, hài hòa',
    description: 'Hạnh phúc viên mãn trong gia đình và các mối quan hệ.',
    keywords: ['gia đình', 'hạnh phúc', 'hoàn thành', 'hài hòa'],
    image: '🏠',
    type: 'minor',
    suit: 'cups'
  },
  {
    id: 'page-of-cups',
    name: 'Page of Cups',
    meaning: 'Cảm xúc mới, sáng tạo, trực giác, thông điệp',
    description: 'Một thông điệp cảm xúc hoặc cơ hội sáng tạo đang đến.',
    keywords: ['cảm xúc', 'sáng tạo', 'trực giác', 'thông điệp'],
    image: '🐠',
    type: 'minor',
    suit: 'cups'
  },
  {
    id: 'knight-of-cups',
    name: 'Knight of Cups',
    meaning: 'Lãng mạn, theo đuổi, cảm xúc, nghệ sĩ',
    description: 'Theo đuổi những giấc mơ với trái tim đầy đam mê.',
    keywords: ['lãng mạn', 'theo đuổi', 'cảm xúc', 'nghệ sĩ'],
    image: '🎨',
    type: 'minor',
    suit: 'cups'
  },
  {
    id: 'queen-of-cups',
    name: 'Queen of Cups',
    meaning: 'Đồng cảm, trực giác, nuôi dưỡng, cảm xúc',
    description: 'Sử dụng trực giác và lòng compassion để hướng dẫn.',
    keywords: ['đồng cảm', 'trực giác', 'nuôi dưỡng', 'compassion'],
    image: '🌊',
    type: 'minor',
    suit: 'cups'
  },
  {
    id: 'king-of-cups',
    name: 'King of Cups',
    meaning: 'Cân bằng cảm xúc, khôn ngoan, kiểm soát, lãnh đạo',
    description: 'Cân bằng giữa cảm xúc và lý trí để đưa ra quyết định.',
    keywords: ['cân bằng', 'khôn ngoan', 'kiểm soát', 'lãnh đạo'],
    image: '🧠',
    type: 'minor',
    suit: 'cups'
  },

  // Swords (Kiếm) - Air Element
  {
    id: 'ace-of-swords',
    name: 'Ace of Swords',
    meaning: 'Ý tưởng mới, rõ ràng, chân lý, đột phá',
    description: 'Một ý tưởng mới và rõ ràng đang xuất hiện.',
    keywords: ['ý tưởng', 'rõ ràng', 'chân lý', 'đột phá'],
    image: '💡',
    type: 'minor',
    suit: 'swords'
  },
  {
    id: 'two-of-swords',
    name: 'Two of Swords',
    meaning: 'Quyết định khó khăn, cân bằng, bế tắc, lựa chọn',
    description: 'Bạn đang đối mặt với một quyết định khó khăn.',
    keywords: ['quyết định', 'cân bằng', 'bế tắc', 'lựa chọn'],
    image: '⚖️',
    type: 'minor',
    suit: 'swords'
  },
  {
    id: 'three-of-swords',
    name: 'Three of Swords',
    meaning: 'Đau khổ, chia ly, bị phản bội, nỗi buồn',
    description: 'Thời gian khó khăn về mặt cảm xúc nhưng sẽ qua đi.',
    keywords: ['đau khổ', 'chia ly', 'phản bội', 'chữa lành'],
    image: '💔',
    type: 'minor',
    suit: 'swords'
  },
  {
    id: 'four-of-swords',
    name: 'Four of Swords',
    meaning: 'Nghỉ ngơi, thiền định, phục hồi, bình yên',
    description: 'Thời gian để nghỉ ngơi và phục hồi năng lượng.',
    keywords: ['nghỉ ngơi', 'thiền định', 'phục hồi', 'bình yên'],
    image: '😴',
    type: 'minor',
    suit: 'swords'
  },
  {
    id: 'five-of-swords',
    name: 'Five of Swords',
    meaning: 'Xung đột, thất bại, tổn thất, bài học',
    description: 'Một thất bại nhưng mang lại bài học quý giá.',
    keywords: ['xung đột', 'thất bại', 'tổn thất', 'bài học'],
    image: '😔',
    type: 'minor',
    suit: 'swords'
  },
  {
    id: 'six-of-swords',
    name: 'Six of Swords',
    meaning: 'Chuyển đổi, di chuyển, phục hồi, tiến bộ',
    description: 'Di chuyển từ khó khăn sang thời kỳ bình yên hơn.',
    keywords: ['chuyển đổi', 'di chuyển', 'phục hồi', 'tiến bộ'],
    image: '⛵',
    type: 'minor',
    suit: 'swords'
  },
  {
    id: 'seven-of-swords',
    name: 'Seven of Swords',
    meaning: 'Lừa dối, chiến lược, trốn tránh, bí mật',
    description: 'Cần cẩn thận với những người xung quanh.',
    keywords: ['lừa dối', 'chiến lược', 'trốn tránh', 'cẩn thận'],
    image: '🕵️',
    type: 'minor',
    suit: 'swords'
  },
  {
    id: 'eight-of-swords',
    name: 'Eight of Swords',
    meaning: 'Hạn chế, tù túng, nạn nhân, giải phóng',
    description: 'Bạn có thể cảm thấy bị mắc kẹt nhưng sự giải phóng có thể.',
    keywords: ['hạn chế', 'tù túng', 'mắc kẹt', 'giải phóng'],
    image: '🪢',
    type: 'minor',
    suit: 'swords'
  },
  {
    id: 'nine-of-swords',
    name: 'Nine of Swords',
    meaning: 'Lo lắng, ác mộng, căng thẳng, suy nghĩ tiêu cực',
    description: 'Lo lắng và căng thẳng đang ảnh hưởng đến giấc ngủ.',
    keywords: ['lo lắng', 'ác mộng', 'căng thẳng', 'suy nghĩ'],
    image: '😰',
    type: 'minor',
    suit: 'swords'
  },
  {
    id: 'ten-of-swords',
    name: 'Ten of Swords',
    meaning: 'Kết thúc, phản bội, đau khổ, khởi đầu mới',
    description: 'Một giai đoạn khó khăn đang kết thúc, sự khởi đầu mới đang đến.',
    keywords: ['kết thúc', 'đau khổ', 'phản bội', 'khởi đầu'],
    image: '🌅',
    type: 'minor',
    suit: 'swords'
  },
  {
    id: 'page-of-swords',
    name: 'Page of Swords',
    meaning: 'Tò mò, học hỏi, tin tức, ý tưởng mới',
    description: 'Tin tức mới hoặc ý tưởng thú vị đang đến.',
    keywords: ['tò mò', 'học hỏi', 'tin tức', 'ý tưởng'],
    image: '📚',
    type: 'minor',
    suit: 'swords'
  },
  {
    id: 'knight-of-swords',
    name: 'Knight of Swords',
    meaning: 'Hành động nhanh, xung động, can đảm, thay đổi',
    description: 'Hành động quyết liệt và nhanh chóng để đạt mục tiêu.',
    keywords: ['nhanh chóng', 'xung động', 'can đảm', 'thay đổi'],
    image: '⚡',
    type: 'minor',
    suit: 'swords'
  },
  {
    id: 'queen-of-swords',
    name: 'Queen of Swords',
    meaning: 'Trí tuệ, độc lập, rõ ràng, trung thực',
    description: 'Sử dụng trí tuệ và sự rõ ràng để đưa ra quyết định.',
    keywords: ['trí tuệ', 'độc lập', 'rõ ràng', 'trung thực'],
    image: '🧐',
    type: 'minor',
    suit: 'swords'
  },
  {
    id: 'king-of-swords',
    name: 'King of Swords',
    meaning: 'Trí tuệ, quyền lực, công lý, quyết đoán',
    description: 'Lãnh đạo bằng trí tuệ và sự công bằng.',
    keywords: ['trí tuệ', 'quyền lực', 'công lý', 'quyết đoán'],
    image: '👨‍⚖️',
    type: 'minor',
    suit: 'swords'
  },

  // Pentacles (Đồng xu) - Earth Element
  {
    id: 'ace-of-pentacles',
    name: 'Ace of Pentacles',
    meaning: 'Cơ hội mới, thịnh vượng, biểu hiện, tiềm năng',
    description: 'Một cơ hội mới về tài chính hoặc vật chất đang xuất hiện.',
    keywords: ['cơ hội', 'thịnh vượng', 'biểu hiện', 'tiềm năng'],
    image: '💰',
    type: 'minor',
    suit: 'pentacles'
  },
  {
    id: 'two-of-pentacles',
    name: 'Two of Pentacles',
    meaning: 'Cân bằng, ưu tiên, thích ứng, đa nhiệm',
    description: 'Cần cân bằng nhiều trách nhiệm và ưu tiên.',
    keywords: ['cân bằng', 'ưu tiên', 'thích ứng', 'đa nhiệm'],
    image: '🤹',
    type: 'minor',
    suit: 'pentacles'
  },
  {
    id: 'three-of-pentacles',
    name: 'Three of Pentacles',
    meaning: 'Hợp tác, nhóm, kỹ năng, học hỏi',
    description: 'Làm việc nhóm và hợp tác sẽ mang lại thành công.',
    keywords: ['hợp tác', 'nhóm', 'kỹ năng', 'học hỏi'],
    image: '👥',
    type: 'minor',
    suit: 'pentacles'
  },
  {
    id: 'four-of-pentacles',
    name: 'Four of Pentacles',
    meaning: 'Bảo thủ, tiết kiệm, an toàn, kiểm soát',
    description: 'Bảo vệ tài sản nhưng đừng quá bảo thủ.',
    keywords: ['bảo thủ', 'tiết kiệm', 'an toàn', 'kiểm soát'],
    image: '🔒',
    type: 'minor',
    suit: 'pentacles'
  },
  {
    id: 'five-of-pentacles',
    name: 'Five of Pentacles',
    meaning: 'Khó khăn tài chính, nghèo đói, cô đơn, hỗ trợ',
    description: 'Thời kỳ khó khăn nhưng sự giúp đỡ đang đến gần.',
    keywords: ['khó khăn', 'nghèo đói', 'cô đơn', 'hỗ trợ'],
    image: '❄️',
    type: 'minor',
    suit: 'pentacles'
  },
  {
    id: 'six-of-pentacles',
    name: 'Six of Pentacles',
    meaning: 'Cho và nhận, từ thiện, cân bằng, hào phóng',
    description: 'Thời gian để cho đi và nhận lại một cách cân bằng.',
    keywords: ['cho nhận', 'từ thiện', 'cân bằng', 'hào phóng'],
    image: '🤝',
    type: 'minor',
    suit: 'pentacles'
  },
  {
    id: 'seven-of-pentacles',
    name: 'Seven of Pentacles',
    meaning: 'Kiên nhẫn, đầu tư, chờ đợi, đánh giá',
    description: 'Thời gian để kiên nhẫn chờ đợi kết quả đầu tư.',
    keywords: ['kiên nhẫn', 'đầu tư', 'chờ đợi', 'đánh giá'],
    image: '🌱',
    type: 'minor',
    suit: 'pentacles'
  },
  {
    id: 'eight-of-pentacles',
    name: 'Eight of Pentacles',
    meaning: 'Tay nghề, chăm chỉ, cải thiện, chuyên môn',
    description: 'Tập trung vào việc cải thiện kỹ năng và tay nghề.',
    keywords: ['tay nghề', 'chăm chỉ', 'cải thiện', 'chuyên môn'],
    image: '🔨',
    type: 'minor',
    suit: 'pentacles'
  },
  {
    id: 'nine-of-pentacles',
    name: 'Nine of Pentacles',
    meaning: 'Thành tựu, độc lập, sang trọng, tự tin',
    description: 'Thưởng thức thành quả của sự chăm chỉ và kiên trì.',
    keywords: ['thành tựu', 'độc lập', 'sang trọng', 'tự tin'],
    image: '🏺',
    type: 'minor',
    suit: 'pentacles'
  },
  {
    id: 'ten-of-pentacles',
    name: 'Ten of Pentacles',
    meaning: 'Thịnh vượng gia đình, di sản, ổn định lâu dài',
    description: 'Thịnh vượng và ổn định cho gia đình qua nhiều thế hệ.',
    keywords: ['thịnh vượng', 'gia đình', 'di sản', 'ổn định'],
    image: '🏰',
    type: 'minor',
    suit: 'pentacles'
  },
  {
    id: 'page-of-pentacles',
    name: 'Page of Pentacles',
    meaning: 'Học hỏi, nghiên cứu, cơ hội mới, khởi đầu',
    description: 'Cơ hội học hỏi và phát triển kỹ năng mới.',
    keywords: ['học hỏi', 'nghiên cứu', 'cơ hội', 'khởi đầu'],
    image: '📖',
    type: 'minor',
    suit: 'pentacles'
  },
  {
    id: 'knight-of-pentacles',
    name: 'Knight of Pentacles',
    meaning: 'Chăm chỉ, đáng tin cậy, kiên trì, thực tế',
    description: 'Tiếp tục chăm chỉ và kiên trì để đạt được mục tiêu.',
    keywords: ['chăm chỉ', 'tin cậy', 'kiên trì', 'thực tế'],
    image: '🐂',
    type: 'minor',
    suit: 'pentacles'
  },
  {
    id: 'queen-of-pentacles',
    name: 'Queen of Pentacles',
    meaning: 'Nuôi dưỡng, thực tế, an toàn, thịnh vượng',
    description: 'Chăm sóc bản thân và người khác một cách thực tế.',
    keywords: ['nuôi dưỡng', 'thực tế', 'an toàn', 'thịnh vượng'],
    image: '🌿',
    type: 'minor',
    suit: 'pentacles'
  },
  {
    id: 'king-of-pentacles',
    name: 'King of Pentacles',
    meaning: 'Thành công tài chính, lãnh đạo, an toàn, doanh nhân',
    description: 'Đạt được thành công và ổn định về mặt tài chính.',
    keywords: ['thành công', 'lãnh đạo', 'an toàn', 'doanh nhân'],
    image: '👨‍💼',
    type: 'minor',
    suit: 'pentacles'
  }
];

export const allCards = [...majorArcana, ...minorArcana];

export const getRandomCards = (count: number): TarotCardData[] => {
  const shuffled = [...allCards].sort(() => 0.5 - Math.random());
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
      'hermit': 'Hãy dành thời gian tìm hiểu bản thân trước khi yêu ai đó.',
      'ace-of-cups': 'Tình yêu mới đang chờ đợi bạn mở lòng đón nhận.',
      'two-of-cups': 'Một mối quan hệ hài hòa và cân bằng đang phát triển.',
      'three-of-cups': 'Tình bạn có thể phát triển thành tình yêu.',
      'ten-of-cups': 'Hạnh phúc viên mãn trong tình yêu và gia đình.'
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
      'hermit': 'Đây là lúc để suy ngẫm về hướng đi nghề nghiệp.',
      'ace-of-wands': 'Một dự án mới đầy cảm hứng sắp bắt đầu.',
      'three-of-pentacles': 'Hợp tác nhóm sẽ mang lại thành công trong công việc.',
      'eight-of-pentacles': 'Tập trung cải thiện kỹ năng nghề nghiệp.',
      'ten-of-pentacles': 'Sự nghiệp ổn định và thành công lâu dài.'
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
      'hermit': 'Dành thời gian lập kế hoạch tài chính dài hạn.',
      'ace-of-pentacles': 'Cơ hội tài chính mới đầy tiềm năng.',
      'six-of-pentacles': 'Cân bằng giữa cho và nhận trong tài chính.',
      'nine-of-pentacles': 'Thành quả tài chính từ sự chăm chỉ.',
      'ten-of-pentacles': 'Thịnh vượng tài chính lâu dài cho gia đình.'
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
      'hermit': 'Dành thời gian chất lượng với gia đình.',
      'ten-of-cups': 'Hạnh phúc và hài hòa trong gia đình.',
      'four-of-wands': 'Ăn mừng các cột mốc quan trọng cùng gia đình.',
      'six-of-cups': 'Kỷ niệm đẹp cùng gia đình mang lại niềm vui.',
      'queen-of-pentacles': 'Chăm sóc và nuôi dưỡng gia đình chu đáo.'
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
