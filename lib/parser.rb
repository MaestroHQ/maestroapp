class Parser
  def self.parse(data, parser, description = false)
    if data.respond_to? :read
      data = data.read
    end

    ast = parser.parse data

    if ast
      return (description ? ast.description : ast.content)
    else
      parser.failure_reason =~ /^(Expected .+) after/m
      raise(ParserSyntaxError.new(error: "syntax error"), "syntax error") if $1.nil?
      message =
      "#{$1.gsub("\n", '$NEWLINE')}:" << "\n" <<
      data.lines.to_a[parser.failure_line - 1].to_s << "\n" <<
      "#{'~' * (parser.failure_column - 1)}^"
      raise(ParserSyntaxError.new(error: message), message)
    end
  end
end

class MaestroLangParser
  Treetop.load(File.expand_path(File.join(File.dirname(__FILE__), 'maestro')))
  @@maestro_parser = MaestroParser.new
  def parse(data, description = false)
    Parser.parse(data, @@maestro_parser, description)
  end
end

class ParserSyntaxError < StandardError; end


